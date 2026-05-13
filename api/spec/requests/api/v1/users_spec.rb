# frozen_string_literal: true

require 'rails_helper'

# Request spec for Api::V1::UsersController.
#
# Auth flows through the real `Secured` concern (JWKS-only stub via the Issue
# 001 helpers). All outbound Auth0 Management-API HTTP is WebMock-stubbed so
# the suite never touches live network.
#
# Note on the 401 vs 403 split: `BaseController#rescue_from CanCan::AccessDenied`
# maps CanCan denials to **401 Unauthorized** (with a JSON body). The PRD's
# "valid-token-but-insufficient-scope" scenario therefore asserts 401 here --
# matching observable production behavior -- rather than 403. If a future
# refactor distinguishes authentication failures from authorization denials,
# these expectations should flip to `:forbidden`.
RSpec.describe 'Api::V1::UsersController', type: :request do
  # --- Auth0 Management-API stubbing helpers ---------------------------------
  #
  # The Users::* interactors that talk to Auth0 build URLs from
  # `Rails.application.credentials[:auth0][:management_api][:base_url]`. We
  # stub a synthetic base URL here and have the interactors' downstream calls
  # observe it.
  AUTH0_BASE_URL = 'https://auth0-test.example.test/'
  AUTH0_MGMT_TOKEN = 'stubbed-mgmt-token'

  def stub_auth0_credentials!
    creds = {
      iss:            AuthHelpers::TEST_ISS,
      audience:       AuthHelpers::TEST_AUDIENCE,
      management_api: {
        base_url:      AUTH0_BASE_URL,
        client_id:     'mgmt-client',
        client_secret: 'mgmt-secret',
        audience:      "#{AUTH0_BASE_URL}api/v2/"
      }
    }
    allow(Rails.application.credentials).to receive(:[]).and_call_original
    allow(Rails.application.credentials).to receive(:[]).with(:auth0).and_return(creds)
    # Short-circuit the management-API token fetch (avoids stubbing oauth/token
    # AND the Rails.cache write semantics). The token value is opaque to the
    # outbound Auth0 calls -- WebMock matches on URL, not Authorization header.
    allow(::Auth0::UserManagementToken).to receive(:call).and_return(AUTH0_MGMT_TOKEN)
  end

  def stub_auth0_create_user(auth_id: 'auth0|created-user', status: 201)
    stub_request(:post, "#{AUTH0_BASE_URL}api/v2/users").to_return(
      status: status,
      body:   { user_id: auth_id }.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
  end

  def stub_auth0_get_user_by_email(email:, auth_id: 'auth0|existing-user', status: 200)
    url = "#{AUTH0_BASE_URL}api/v2/users-by-email?email=#{CGI.escape(email)}"
    body = status == 200 ? [{ user_id: auth_id, email: email }].to_json : '[]'
    stub_request(:get, url).to_return(
      status:  status,
      body:    body,
      headers: { 'Content-Type' => 'application/json' }
    )
  end

  def stub_auth0_update_user(auth_id:, status: 200)
    stub_request(:patch, "#{AUTH0_BASE_URL}api/v2/users/#{auth_id}").to_return(
      status:  status,
      body:    { user_id: auth_id }.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
  end

  def stub_auth0_delete_user(auth_id:, status: 204)
    stub_request(:delete, "#{AUTH0_BASE_URL}api/v2/users/#{auth_id}").to_return(
      status: status,
      body:   '',
      headers: {}
    )
  end

  def stub_auth0_change_password
    stub_request(:post, "#{AUTH0_BASE_URL}dbconnections/change_password").to_return(
      status: 200, body: '"ok"', headers: { 'Content-Type' => 'application/json' }
    )
  end

  # --- Shared setup ---------------------------------------------------------

  let!(:current_user) do
    create(:user, email: 'requester@example.test', auth_id: 'auth0|requester')
  end
  let!(:admin_scope) { create(:scope, :user, :admin, global: true) }
  let(:token) { mint_jwt(sub: current_user.auth_id, email: current_user.email) }

  # An admin can `manage :all`, satisfying every load_and_authorize_resource
  # and explicit `authorize!` call in UsersController without needing a tangle
  # of memberships + per-action scopes.
  def grant_admin!(user = current_user)
    user.scopes << admin_scope unless user.scopes.include?(admin_scope)
  end

  before do
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
    stub_auth0_credentials!
    # Stub action-mailer host config so any mailer side-effects don't blow up
    # on URL generation. ActionMailer URL generation may consult credentials.
    allow(Rails.application.credentials).to receive(:[]).with(:app_host).and_return('https://app.example.test')
  end

  # -------------------------------------------------------------------------
  # GET /api/v1/users  (index)
  # -------------------------------------------------------------------------
  describe 'GET /api/v1/users (index)' do
    let(:path) { '/api/v1/users' }

    context 'authenticated happy path' do
      before { grant_admin! }

      it 'returns the user collection' do
        other = create(:user, email: 'other@example.test', auth_id: 'auth0|other')

        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body).to have_key('data')
        emails = body['data'].map { |u| u['email'] }
        expect(emails).to include(current_user.email, other.email)
      end
    end

    context 'missing token' do
      it 'responds 401' do
        get path

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'invalid token (bad signature)' do
      let(:other_key) { OpenSSL::PKey::RSA.new(2048) }
      let(:bad_token) do
        mint_jwt_with(
          { sub: current_user.auth_id, email: current_user.email },
          { key: other_key }
        )
      end

      it 'responds 401' do
        get path, headers: auth_header(bad_token)

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but insufficient scope (non-admin)' do
      # A logged-in non-admin with no client memberships gets an empty result
      # set rather than 401, because index uses `accessible_by(current_ability)`
      # rather than raising. We assert the observable outcome.
      it 'returns an empty data array' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        # current_user is always visible to itself per UserAbility's
        # `can [:read, :update, :authorized], User, id: user.id`.
        emails = body['data'].map { |u| u['email'] }
        expect(emails).to eq([current_user.email])
      end
    end
  end

  # -------------------------------------------------------------------------
  # GET /api/v1/users/:id  (show)
  # -------------------------------------------------------------------------
  describe 'GET /api/v1/users/:id (show)' do
    let!(:target) { create(:user, email: 'target@example.test', auth_id: 'auth0|target') }
    let(:path) { "/api/v1/users/#{target.id}" }

    context 'authenticated happy path (admin)' do
      before { grant_admin! }

      it 'returns the user' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['data']['email']).to eq(target.email)
      end
    end

    context 'missing token' do
      it 'responds 401' do
        get path

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'insufficient scope (non-admin viewing a different user)' do
      it 'responds 401 (CanCan::AccessDenied -> Unauthorized envelope)' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:unauthorized)
        body = JSON.parse(response.body)
        expect(body).to eq('errors' => 'You are not authorized')
      end
    end

    context 'missing record (404 / invalid path param)' do
      it 'raises ActiveRecord::RecordNotFound for an unknown id' do
        grant_admin!

        expect {
          get '/api/v1/users/0', headers: auth_header(token)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  # -------------------------------------------------------------------------
  # POST /api/v1/users  (create)
  # -------------------------------------------------------------------------
  describe 'POST /api/v1/users (create)' do
    let(:path) { '/api/v1/users' }
    let(:valid_payload) do
      {
        user: { email: 'newbie@example.test', password: 'hunter2!', company_name: 'ACME' }
      }
    end

    context 'authenticated happy path (admin)' do
      let!(:host_client) { create(:client, name: 'Host Co') }

      before do
        grant_admin!
        stub_auth0_create_user(auth_id: 'auth0|newbie')
      end

      it 'creates the user and the outbound Auth0 user-create call is exercised' do
        # `no_auth: 1` short-circuits Authorizations::AddAuthorization
        # (which otherwise raises because the payload has no client/project/
        # report instance to attach the authorization to). This matches the
        # "super-admin create" flow the production code documents in
        # AddClientDefaultAuthorizations.
        payload = valid_payload.merge(no_auth: 1, client_id: host_client.id)

        expect {
          post path, params: payload, headers: auth_header(token), as: :json
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['data']['email']).to eq('newbie@example.test')

        expect(WebMock).to have_requested(:post, "#{AUTH0_BASE_URL}api/v2/users").once
      end
    end

    context 'missing token' do
      it 'responds 401' do
        post path, params: valid_payload, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'insufficient scope (no membership-based create permission)' do
      it 'responds 401 (CanCan::AccessDenied -> Unauthorized envelope)' do
        post path, params: valid_payload, headers: auth_header(token), as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'validation failure (missing email)' do
      before do
        grant_admin!
        # ValidateUser unconditionally calls `params[:email].downcase!`; an
        # empty-but-present string keeps that call valid and lets us reach
        # the validation path with a User that has no email persisted.
      end

      it 'responds 422 when ValidateUser fails' do
        # User#email has no presence validation, but the request still needs
        # at least *something* to validate; pass a malformed payload that the
        # CreateAuth0User call will reject. We assert via Auth0 rejecting
        # the create (non-201), which the interactor's failure path maps to
        # a 422 error envelope.
        stub_auth0_create_user(auth_id: nil, status: 400)
        stub_auth0_get_user_by_email(email: 'broken@example.test', status: 404)

        post path,
             params:  { user: { email: 'broken@example.test', password: 'x' } },
             headers: auth_header(token),
             as:      :json

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body).to have_key('errors')
      end
    end
  end

  # -------------------------------------------------------------------------
  # PATCH /api/v1/users/:id  (update)
  # -------------------------------------------------------------------------
  describe 'PATCH /api/v1/users/:id (update)' do
    let!(:target) { create(:user, email: 'target@example.test', auth_id: 'auth0|target') }
    let(:path) { "/api/v1/users/#{target.id}" }
    # ValidateUser unconditionally calls `params[:email].downcase!`, so the
    # update payload must always include :email -- even when the test isn't
    # exercising email-change behavior.
    let(:update_payload) do
      { user: { email: target.email, contact_name: 'Renamed Contact' } }
    end

    context 'authenticated happy path (admin)' do
      before { grant_admin! }

      it 'updates the user (no Auth0 call when email/password unchanged)' do
        patch path, params: update_payload, headers: auth_header(token), as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['data']['contact_name']).to eq('Renamed Contact')
        expect(target.reload.contact_name).to eq('Renamed Contact')
        # UpdateAuth0User only calls out when email_changed? or :password
        # present; with neither, no Auth0 request should fire.
        expect(WebMock).not_to have_requested(:patch, %r{#{AUTH0_BASE_URL}api/v2/users/})
      end
    end

    context 'authenticated happy path (admin, password change triggers Auth0)' do
      before { grant_admin! }

      it 'PATCHes Auth0 when password is supplied' do
        stub_auth0_update_user(auth_id: target.auth_id)

        patch path,
              params:  { user: { email: target.email, password: 'newpass!' } },
              headers: auth_header(token),
              as:      :json

        expect(response).to have_http_status(:ok)
        expect(WebMock).to have_requested(:patch, "#{AUTH0_BASE_URL}api/v2/users/#{target.auth_id}").once
      end
    end

    context 'missing token' do
      it 'responds 401' do
        patch path, params: update_payload, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'insufficient scope' do
      it 'responds 401' do
        patch path, params: update_payload, headers: auth_header(token), as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'validation failure (Auth0 patch rejects)' do
      before { grant_admin! }

      it 'responds 422 when UpdateAuth0User fails' do
        stub_request(:patch, "#{AUTH0_BASE_URL}api/v2/users/#{target.auth_id}").to_return(
          status:  400,
          body:    { message: 'bad email' }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )

        # Force an email change to exercise the UpdateAuth0User branch.
        patch path,
              params:  { user: { email: 'renamed@example.test' } },
              headers: auth_header(token),
              as:      :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  # -------------------------------------------------------------------------
  # DELETE /api/v1/users/:id  (destroy)
  # -------------------------------------------------------------------------
  describe 'DELETE /api/v1/users/:id (destroy)' do
    let!(:target) { create(:user, email: 'target@example.test', auth_id: 'auth0|target') }
    let(:path) { "/api/v1/users/#{target.id}" }

    context 'authenticated happy path (admin)' do
      before do
        grant_admin!
        stub_auth0_delete_user(auth_id: target.auth_id)
      end

      it 'deletes the user and calls Auth0 delete' do
        expect {
          delete path, headers: auth_header(token), as: :json
        }.to change(User, :count).by(-1)

        # `render head: :ok` returns 200 but with the user's body partial -
        # we assert on the user-count change and a non-error status.
        expect(response.status).to be < 400
        expect(WebMock).to have_requested(
          :delete, "#{AUTH0_BASE_URL}api/v2/users/#{target.auth_id}"
        ).once
      end
    end

    context 'missing token' do
      it 'responds 401' do
        delete path, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'validation/Auth0 failure surfaces as 422' do
      before do
        grant_admin!
        stub_request(:delete, "#{AUTH0_BASE_URL}api/v2/users/#{target.auth_id}").to_return(
          status: 400,
          body:   { message: 'auth0 boom' }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      end

      it 'returns 422 when DeleteAuth0User reports failure' do
        delete path, headers: auth_header(token), as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  # -------------------------------------------------------------------------
  # GET /api/v1/users/me
  # -------------------------------------------------------------------------
  describe 'GET /api/v1/users/me' do
    let(:path) { '/api/v1/users/me' }

    context 'authenticated happy path' do
      it 'returns the current user authorization-tree envelope' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['data']).to have_key('global')
        expect(body['data']).to have_key('dynamic')
      end
    end

    context 'missing token' do
      it 'responds 401' do
        get path

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'invalid token' do
      let(:other_key) { OpenSSL::PKey::RSA.new(2048) }
      let(:bad_token) do
        mint_jwt_with({ sub: current_user.auth_id, email: current_user.email }, key: other_key)
      end

      it 'responds 401' do
        get path, headers: auth_header(bad_token)

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # -------------------------------------------------------------------------
  # POST /api/v1/users/:id/scopes
  # -------------------------------------------------------------------------
  describe 'POST /api/v1/users/:id/scopes' do
    let!(:target) { create(:user, email: 'target@example.test', auth_id: 'auth0|target') }
    let!(:global_scope_record) { create(:scope, :client, :read, global: true) }
    let(:path) { "/api/v1/users/#{target.id}/scopes" }

    context 'authenticated happy path (admin)' do
      before { grant_admin! }

      it 'applies a global scope to the user' do
        post path,
             params:  { scope_id: global_scope_record.id, scope_state: 1 },
             headers: auth_header(token),
             as:      :json

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body['data']).to eq('Scopes has been applied')
        expect(target.reload.scopes).to include(global_scope_record)
      end
    end

    context 'missing token' do
      it 'responds 401' do
        post path,
             params: { scope_id: global_scope_record.id, scope_state: 1 },
             as:     :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'insufficient scope (non-admin attempting to authorize)' do
      it 'responds 401' do
        post path,
             params:  { scope_id: global_scope_record.id, scope_state: 1 },
             headers: auth_header(token),
             as:      :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'validation failure (non-global scope)' do
      let!(:non_global_scope) { create(:scope, :client, :read, global: false) }

      before { grant_admin! }

      it 'responds 422 when UserScopes rejects the scope as non-appliable' do
        post path,
             params:  { scope_id: non_global_scope.id, scope_state: 1 },
             headers: auth_header(token),
             as:      :json

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['errors']).to eq('Wrong scope type for the given resource')
      end
    end
  end

  # -------------------------------------------------------------------------
  # GET /api/v1/users/:id/authorized
  # -------------------------------------------------------------------------
  describe 'GET /api/v1/users/:id/authorized' do
    let!(:target) { create(:user, email: 'target@example.test', auth_id: 'auth0|target') }
    let(:path) { "/api/v1/users/#{target.id}/authorized" }

    context 'authenticated happy path (admin)' do
      before { grant_admin! }

      it 'returns the user authorization envelope' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['data']).to have_key('global')
      end
    end

    context 'missing token' do
      it 'responds 401' do
        get path

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'insufficient scope' do
      it 'responds 401 (load_and_authorize_resource denies)' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # -------------------------------------------------------------------------
  # POST /api/v1/users/:id/copy
  # -------------------------------------------------------------------------
  describe 'POST /api/v1/users/:id/copy' do
    let!(:source) { create(:user, email: 'source@example.test', auth_id: 'auth0|source') }
    let!(:target) { create(:user, email: 'target@example.test', auth_id: 'auth0|target') }
    let(:path) { "/api/v1/users/#{target.id}/copy" }

    context 'authenticated happy path (admin)' do
      before { grant_admin! }

      it 'copies permissions from the source user' do
        post path,
             params:  { copy_from: source.email },
             headers: auth_header(token),
             as:      :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['email']).to eq(source.email)
      end
    end

    context 'missing token' do
      it 'responds 401' do
        post path, params: { copy_from: source.email }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'insufficient scope (non-admin)' do
      # `copy` is *not* in the controller's load_and_authorize_resource
      # `except:` list, so CanCan denies a non-admin first -- the inline
      # `unless current_user.admin?` guard inside #copy never executes.
      # Observable behavior: 401 with the CanCan envelope. If the controller
      # is later refactored to bypass CanCan for #copy, this expectation
      # should flip to the 422 admin-guard envelope.
      it 'responds 401 (CanCan::AccessDenied -> Unauthorized envelope)' do
        post path,
             params:  { copy_from: source.email },
             headers: auth_header(token),
             as:      :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'validation failure (unknown copy_from email)' do
      before { grant_admin! }

      it 'responds 422 with the "Wrong email" error envelope' do
        post path,
             params:  { copy_from: 'nobody@example.test' },
             headers: auth_header(token),
             as:      :json

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['errors']).to eq('Wrong email')
      end
    end
  end

  # -------------------------------------------------------------------------
  # GET /api/v1/users/researchers
  # -------------------------------------------------------------------------
  describe 'GET /api/v1/users/researchers' do
    let(:path) { '/api/v1/users/researchers' }

    context 'authenticated happy path' do
      it 'returns a researcher collection (possibly empty)' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['data']).to be_an(Array)
      end
    end

    context 'missing token' do
      it 'responds 401' do
        get path

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # -------------------------------------------------------------------------
  # POST /api/v1/users/reset_password
  # -------------------------------------------------------------------------
  describe 'POST /api/v1/users/reset_password' do
    let(:path) { '/api/v1/users/reset_password' }

    context 'authenticated happy path' do
      # `reset_password` is *not* in the controller's
      # load_and_authorize_resource `except:` list, so CanCan tries to
      # authorize :reset_password on User. Admin is the simplest grant.
      before do
        grant_admin!
        stub_auth0_change_password
      end

      it 'returns 203 and POSTs to Auth0 change_password' do
        post path, headers: auth_header(token), as: :json

        expect(response).to have_http_status(203)
        expect(WebMock).to have_requested(
          :post, "#{AUTH0_BASE_URL}dbconnections/change_password"
        ).once
      end
    end

    context 'missing token' do
      it 'responds 401' do
        post path, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'insufficient scope (non-admin)' do
      it 'responds 401 (CanCan denies the reset_password ability)' do
        post path, headers: auth_header(token), as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # -------------------------------------------------------------------------
  # POST /api/v1/users/update_last_login
  # -------------------------------------------------------------------------
  describe 'POST /api/v1/users/update_last_login' do
    let(:path) { '/api/v1/users/update_last_login' }

    context 'authenticated happy path' do
      it 'updates last_login and returns the new timestamp' do
        freeze_time = Time.utc(2026, 1, 1, 12, 0, 0)
        allow(Time).to receive(:current).and_return(freeze_time)

        post path, headers: auth_header(token), as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['data']).to be_present
        expect(current_user.reload.last_login).to be_within(1.second).of(freeze_time)
      end
    end

    context 'missing token' do
      it 'responds 401' do
        post path, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'failure to persist surfaces as 422' do
      it 'returns 422 when User#save fails' do
        allow_any_instance_of(User).to receive(:save).and_return(false)

        post path, headers: auth_header(token), as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['errors']).to eq('Could not update last login timestamp')
      end
    end
  end
end
