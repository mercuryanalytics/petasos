# frozen_string_literal: true

require 'rails_helper'

# Request specs for Api::V1::ClientsController.
#
# These exercise every action through the real HTTP boundary and the real
# MercurySsoAuth0/JsonWebToken verification path via AuthHelpers (issue 001).
# Only the JWKS HTTP fetch is stubbed. The legacy controller spec at
# spec/controllers/api/v1/clients_controller_spec.rb (which stubs
# `JsonWebToken.verify`) is intentionally not modified.
#
# Coverage scenarios per action (per PRD user stories 1, 2, 9, 10):
#   - authenticated happy path
#   - missing or invalid token => 401
#   - valid token, insufficient scope (authorization failure) => observable
#     401 (production code rescues CanCan::AccessDenied with status
#     :unauthorized; documented below)
#   - validation failure where applicable => 422
#
# IMPORTANT note on the 403 acceptance criterion in the issue:
#   The PRD asks for a "valid token with insufficient scope (403)" scenario,
#   but Api::V1::BaseController currently maps CanCan::AccessDenied to
#   :unauthorized (HTTP 401), not :forbidden (HTTP 403). The PRD also
#   explicitly says specs should assert *externally observable* behavior, not
#   the intended-but-not-yet-implemented behavior. So these specs assert 401
#   for the insufficient-scope path and document the discrepancy here so a
#   future fix (flipping the status to :forbidden) is one line in both
#   places. The same observation appears in the base_controller spec.
RSpec.describe 'Api::V1::Clients', type: :request do
  # Use find_or_create_by to avoid sporadic PG deadlocks when sibling
  # worktrees / parallel agents share the petasos_test database -- the
  # Scope model has no DB-level unique index, so concurrent INSERTs of the
  # same `(scope, action)` tuple can deadlock during row-lock acquisition.
  let(:admin_scope) do
    Scope.find_or_create_by(scope: 'user', action: 'admin')
  end
  let!(:admin_user) do
    create(:user, email: 'admin@example.test', auth_id: 'auth0|admin').tap do |u|
      u.scopes << admin_scope
    end
  end
  # Authorizations::AddAuthorization (the third step of CreateClientOrganizer)
  # falls back through `user.memberships.first` and then `User.find(user_id)`
  # when no membership exists for the new client. Give the admin a pre-existing
  # membership so the create-path AddAuthorization doesn't crash on
  # `User.find(nil)`. The legacy controller spec relies on the same setup.
  let!(:admin_membership_client) { create(:client) }
  let!(:admin_membership) do
    create(:membership, user: admin_user, client: admin_membership_client)
  end

  let(:admin_token) { mint_jwt(sub: admin_user.auth_id, email: admin_user.email) }
  let(:admin_headers) { auth_header(admin_token).merge('Content-Type' => 'application/json') }

  # A non-admin user with no memberships and no authorizations. Hits the
  # ClientAbility `client_ids: []` branch -> CanCan::AccessDenied -> 401.
  let!(:unprivileged_user) do
    create(:user, email: 'no-scope@example.test', auth_id: 'auth0|no-scope')
  end
  let(:unprivileged_token) do
    mint_jwt(sub: unprivileged_user.auth_id, email: unprivileged_user.email)
  end
  let(:unprivileged_headers) do
    auth_header(unprivileged_token).merge('Content-Type' => 'application/json')
  end

  before do
    # See spec/requests/auth_integration_spec.rb -- without this Rails 6's
    # host authorization 403s the default www.example.com host before
    # auth even runs.
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
  end

  describe 'GET /api/v1/clients' do
    let!(:client_a) { create(:client, name: 'Alpha Corp') }
    let!(:client_b) { create(:client, name: 'Beta Corp') }

    context 'authenticated as admin' do
      it 'returns 200 with all clients in the data envelope' do
        get '/api/v1/clients', headers: admin_headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('data')
        names = body.fetch('data').pluck('name')
        expect(names).to include(client_a.name, client_b.name)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get '/api/v1/clients'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get '/api/v1/clients', headers: auth_header('not-a-real-jwt')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      # Non-admin with no memberships -> ClientAbility#client_ids => [] ->
      # CanCan returns no records for `accessible_by`. For index this means
      # an empty list (NOT a 403/401) -- this is the observable behavior of
      # the existing implementation. Documenting it here so any future
      # change to harden the index action surfaces as a spec failure.
      it 'returns 200 with an empty list (no accessible clients)' do
        get '/api/v1/clients', headers: unprivileged_headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to eq('data' => [])
      end
    end
  end

  describe 'GET /api/v1/clients/:id' do
    let!(:client) { create(:client, name: 'Gamma Corp') }

    context 'authenticated as admin' do
      it 'returns 200 with the client payload' do
        get "/api/v1/clients/#{client.id}", headers: admin_headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body.fetch('data')).to include('id' => client.id, 'name' => client.name)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/clients/#{client.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      # load_and_authorize_resource raises CanCan::AccessDenied for show ->
      # base_controller rescues with :unauthorized. (Documented spec-file
      # header note: BaseController maps AccessDenied to 401 not 403.)
      it 'returns 401 with the error envelope' do
        get "/api/v1/clients/#{client.id}", headers: unprivileged_headers

        expect(response).to have_http_status(:unauthorized)
        body = response.parsed_body
        expect(body).to have_key('errors')
      end
    end

    # 404-when-missing is intentionally NOT tested at the request layer:
    # config/environments/test.rb sets `show_exceptions = false`, so
    # ActiveRecord::RecordNotFound propagates out instead of being mapped to
    # 404. That's a Rails test-mode quirk, not a production behavior, and
    # asserting it here would lock in implementation noise. Validation
    # failures (the real 422 path in the acceptance criteria) are exercised
    # by POST and PUT.
  end

  describe 'POST /api/v1/clients' do
    let(:valid_params) { { client: { name: 'Delta Corp' } } }
    let(:invalid_params) { { client: { name: '' } } }

    context 'authenticated as admin with valid params' do
      it 'returns 201 and creates the client' do
        expect do
          post '/api/v1/clients', params: valid_params.to_json, headers: admin_headers
        end.to change(Client, :count).by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body.fetch('data')).to include('name' => 'Delta Corp')
      end
    end

    context 'authenticated as admin with a base64 logo (bare data-URI string, as the UI sends)' do
      # ui/src/components/ClientManage.jsx sets client.logo = avatar.dataURL,
      # i.e. a bare base64 data-URI string. Under Rails 8.1 a bare-string
      # attachable is treated as a signed blob id, so client creation 500'd
      # with ActiveSupport::MessageVerifier::InvalidSignature. The controller
      # must hand active_storage_base64 its documented { data: ... } shape.
      let(:logo_bytes) { (+"\x89PNG\r\n\x1a\nmercury-spec-logo").b }
      let(:logo_data_uri) { "data:image/png;base64,#{Base64.strict_encode64(logo_bytes)}" }
      let(:logo_params) { { client: { name: 'Logo Corp', logo: logo_data_uri } } }

      it 'creates the client and attaches the decoded logo' do
        expect do
          post '/api/v1/clients', params: logo_params.to_json, headers: admin_headers
        end.to change(Client, :count).by(1)

        expect(response).to have_http_status(:created)

        client = Client.find_by!(name: 'Logo Corp')
        expect(client.logo).to be_attached
        expect(client.logo.download.b).to eq(logo_bytes)
        expect(client.logo.blob.content_type).to eq('image/png')
      end
    end

    context 'authenticated as admin with invalid params' do
      it 'returns 422 with an errors envelope' do
        expect do
          post '/api/v1/clients', params: invalid_params.to_json, headers: admin_headers
        end.not_to change(Client, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        body = response.parsed_body
        expect(body).to have_key('errors')
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        post '/api/v1/clients', params: valid_params.to_json, headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      it 'returns 401' do
        post '/api/v1/clients', params: valid_params.to_json, headers: unprivileged_headers

        expect(response).to have_http_status(:unauthorized)
        body = response.parsed_body
        expect(body).to have_key('errors')
      end
    end
  end

  describe 'PUT /api/v1/clients/:id' do
    let!(:client) { create(:client, name: 'Epsilon Corp') }
    let(:valid_params) { { client: { name: 'Epsilon Renamed' } } }
    let(:invalid_params) { { client: { name: '' } } }

    context 'authenticated as admin with valid params' do
      it 'returns 200 and updates the client' do
        put "/api/v1/clients/#{client.id}",
            params: valid_params.to_json,
            headers: admin_headers

        expect(response).to have_http_status(:ok)
        expect(client.reload.name).to eq('Epsilon Renamed')
      end
    end

    context 'authenticated as admin with invalid params' do
      it 'returns 422 with an errors envelope' do
        put "/api/v1/clients/#{client.id}",
            params: invalid_params.to_json,
            headers: admin_headers

        expect(response).to have_http_status(:unprocessable_entity)
        body = response.parsed_body
        expect(body).to have_key('errors')
        expect(client.reload.name).to eq('Epsilon Corp')
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        put "/api/v1/clients/#{client.id}", params: valid_params.to_json, headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      it 'returns 401' do
        put "/api/v1/clients/#{client.id}",
            params: valid_params.to_json,
            headers: unprivileged_headers

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/clients/:id' do
    let!(:client) { create(:client, name: 'Zeta Corp') }

    context 'authenticated as admin' do
      it 'returns 200 and removes the client' do
        expect do
          delete "/api/v1/clients/#{client.id}", headers: admin_headers
        end.to change(Client, :count).by(-1)

        expect(response).to have_http_status(:ok)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        delete "/api/v1/clients/#{client.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      it 'returns 401' do
        expect do
          delete "/api/v1/clients/#{client.id}", headers: unprivileged_headers
        end.not_to change(Client, :count)

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/clients/:id/orphans' do
    let!(:client) { create(:client) }

    context 'authenticated as admin' do
      it 'returns 200 with a data envelope (reports list)' do
        get "/api/v1/clients/#{client.id}/orphans", headers: admin_headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('data')
        # Admin path: Reports::OrphanPerClient short-circuits to [].
        expect(body.fetch('data')).to eq([])
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/clients/#{client.id}/orphans"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      it 'returns 401' do
        # ClientsController#orphans aliases through CanCan via
        # load_and_authorize_resource (member action -> :orphans on Client).
        # For a non-admin with no memberships, the resource cannot be
        # authorized -> 401.
        get "/api/v1/clients/#{client.id}/orphans", headers: unprivileged_headers

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/clients/:id/authorize' do
    let!(:client) { create(:client) }
    let!(:target_user) { create(:user, email: 'target@example.test', auth_id: 'auth0|target') }
    let!(:target_membership) { create(:membership, user: target_user, client: client) }

    let(:authorize_params) do
      {
        user_id: target_user.id,
        client_id: client.id,
        authorize: true
      }
    end

    context 'authenticated as admin with valid params' do
      it 'returns 201 (created) when access is granted' do
        post "/api/v1/clients/#{client.id}/authorize",
             params: authorize_params.to_json,
             headers: admin_headers

        expect(response).to have_http_status(:created)
      end
    end

    # 422 NOTE: ClientsController#authorize wraps Authorizations::
    # BaseAuthorization, which silently no-ops on missing/malformed params
    # (membership_ids returns [] -> create_authorizations is a no-op ->
    # context.status = :ok). There is no reachable 422 path through this
    # action with valid Client routing. The 422 cross-cutting behavior is
    # exercised by POST and PUT above and in the base_controller spec.

    context 'with no Authorization header' do
      it 'returns 401' do
        post "/api/v1/clients/#{client.id}/authorize",
             params: authorize_params.to_json,
             headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      # NOTE: ClientsController#authorize does NOT call
      # load_and_authorize_resource for the member action (the controller
      # uses Client.find directly inside the action). The route is still
      # behind the controller-class-level `load_and_authorize_resource`
      # before_action via CanCan's defaults, so an unprivileged user is
      # blocked before the action body runs.
      it 'returns 401' do
        post "/api/v1/clients/#{client.id}/authorize",
             params: authorize_params.to_json,
             headers: unprivileged_headers

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/clients/:id/authorized' do
    let!(:client) { create(:client) }

    context 'authenticated as admin' do
      it 'returns 200 with a data envelope (users list)' do
        get "/api/v1/clients/#{client.id}/authorized", headers: admin_headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('data')
        expect(body.fetch('data')).to be_an(Array)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/clients/#{client.id}/authorized"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'authenticated but without sufficient scope' do
      it 'returns 401' do
        get "/api/v1/clients/#{client.id}/authorized", headers: unprivileged_headers

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
