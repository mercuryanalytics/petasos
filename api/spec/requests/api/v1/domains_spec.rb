# frozen_string_literal: true

require 'rails_helper'

# Request spec for Api::V1::DomainsController.
#
# Routes through the real auth path -- JsonWebToken.verify (signature, iss,
# decode), Secured concern, Users::GetCurrentUser, and the DomainAbility
# CanCanCan rules -- via the AuthHelpers introduced in issue 001. Only the
# JWKS HTTP fetch is stubbed.
#
# Scenarios per action (per issue 005 acceptance criteria):
#   * authenticated happy path
#   * missing/invalid token (401)
#   * valid token with insufficient scope (renders 401 in this codebase --
#     both BaseController and Secured rescue CanCan::AccessDenied to
#     :unauthorized; the PRD's "(403)" labelling describes the intent of the
#     scenario, while the asserted status reflects observable behavior, per
#     Testing Decisions in the PRD)
#   * validation failure on the body (422)
RSpec.describe 'Api::V1::Domains', type: :request do
  let!(:user) do
    create(:user, email: 'domain-tester@example.test', auth_id: 'auth0|domain-tester')
  end
  let!(:client_record) { create(:client) }
  let!(:membership) { create(:membership, user: user, client: client_record) }

  let(:read_scope)    { create(:scope, :domain, :read) }
  let(:create_scope)  { create(:scope, :domain, :create) }
  let(:update_scope)  { create(:scope, :domain, :update) }
  let(:destroy_scope) { create(:scope, :domain, :destroy) }

  # Authorization with full domain scopes -- happy path for every action.
  let!(:full_authorization) do
    create(
      :client_auth,
      subject_id:    client_record.id,
      client_id:     client_record.id,
      membership_id: membership.id,
      user_id:       user.id,
      scopes:        [read_scope, create_scope, update_scope, destroy_scope]
    )
  end

  let(:valid_token) { mint_jwt(sub: user.auth_id, email: user.email) }

  before do
    # Rails 6 host authorization: test env allowlists only `localhost`.
    # Without this, requests go to www.example.com and get a 403 from
    # ActionDispatch::HostAuthorization, masking the auth response.
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
  end

  describe 'GET /api/v1/clients/:client_id/domains' do
    let!(:domain_a) { create(:domain, client: client_record, name: 'example.test') }
    let!(:domain_b) { create(:domain, client: client_record, name: 'other.test') }
    let!(:other_client) { create(:client) }
    let!(:other_domain) { create(:domain, client: other_client, name: 'unscoped.test') }

    it 'returns the client domains for an authorized user' do
      get "/api/v1/clients/#{client_record.id}/domains", headers: auth_header(valid_token)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body.fetch('data').map { |row| row['name'] }
      expect(names).to match_array([domain_a.name, domain_b.name])
      expect(names).not_to include(other_domain.name)
    end

    it 'responds 401 when the Authorization header is missing' do
      get "/api/v1/clients/#{client_record.id}/domains"

      expect(response).to have_http_status(:unauthorized)
    end

    it 'responds 401 when the token signature does not match the JWKS' do
      attacker_key = OpenSSL::PKey::RSA.new(2048)
      bogus_token = mint_jwt_with(
        { sub: user.auth_id, email: user.email },
        { key: attacker_key }
      )

      get "/api/v1/clients/#{client_record.id}/domains",
          headers: auth_header(bogus_token)

      expect(response).to have_http_status(:unauthorized)
    end

    context 'with a valid token but no domain scopes' do
      let!(:full_authorization) do
        create(
          :client_auth,
          subject_id:    client_record.id,
          client_id:     client_record.id,
          membership_id: membership.id,
          user_id:       user.id,
          scopes:        []
        )
      end

      it 'responds 401 (CanCan::AccessDenied via load_and_authorize_resource)' do
        get "/api/v1/clients/#{client_record.id}/domains",
            headers: auth_header(valid_token)

        # `load_and_authorize_resource` runs ahead of the controller body and
        # raises when DomainAbility grants no rules at all. BaseController
        # rescues CanCan::AccessDenied to :unauthorized -- this is the
        # observable "insufficient scope" outcome for the index action.
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/clients/:client_id/domains' do
    let(:valid_attrs)   { { domain: { name: 'newdomain.test' } } }
    let(:invalid_attrs) { { domain: { name: '' } } }

    it 'creates a domain and returns it' do
      expect {
        post "/api/v1/clients/#{client_record.id}/domains",
             params: valid_attrs,
             headers: auth_header(valid_token)
      }.to change(Domain, :count).by(1)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.fetch('data')).to include('name' => 'newdomain.test')
    end

    it 'responds 401 when the Authorization header is missing' do
      expect {
        post "/api/v1/clients/#{client_record.id}/domains", params: valid_attrs
      }.not_to change(Domain, :count)

      expect(response).to have_http_status(:unauthorized)
    end

    context 'with a valid token but no create:domain scope' do
      let!(:full_authorization) do
        create(
          :client_auth,
          subject_id:    client_record.id,
          client_id:     client_record.id,
          membership_id: membership.id,
          user_id:       user.id,
          scopes:        [read_scope]
        )
      end

      it 'rejects the request with 401 (CanCan::AccessDenied)' do
        expect {
          post "/api/v1/clients/#{client_record.id}/domains",
               params: valid_attrs,
               headers: auth_header(valid_token)
        }.not_to change(Domain, :count)

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when the domain params payload is missing' do
      it 'raises ActionController::ParameterMissing' do
        # Domain has no model-level validations, so the only failure path
        # for a malformed POST body is strong parameters. The test env runs
        # with `action_dispatch.show_exceptions = false`, so the exception
        # bubbles out of the request rather than being rendered as 400 --
        # production maps this to 400. This stand-in for the PRD's "(422)"
        # validation-failure scenario documents the absence of a 422 path
        # for Domain today and will fail loudly if request-handling
        # semantics shift under the Ruby/Rails upgrade.
        expect {
          post "/api/v1/clients/#{client_record.id}/domains",
               params: {},
               headers: auth_header(valid_token)
        }.to raise_error(ActionController::ParameterMissing)
      end
    end
  end

  describe 'GET /api/v1/clients/:client_id/domains/:id' do
    let!(:domain_record) do
      create(:domain, client: client_record, name: 'show.test')
    end

    it 'returns the domain' do
      get "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
          headers: auth_header(valid_token)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.fetch('data')).to include('id' => domain_record.id, 'name' => 'show.test')
    end

    it 'responds 401 without an Authorization header' do
      get "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}"

      expect(response).to have_http_status(:unauthorized)
    end

    context 'with a valid token but no read:domain scope' do
      let!(:full_authorization) do
        create(
          :client_auth,
          subject_id:    client_record.id,
          client_id:     client_record.id,
          membership_id: membership.id,
          user_id:       user.id,
          scopes:        []
        )
      end

      it 'responds 401 (CanCan::AccessDenied via load_and_authorize_resource)' do
        get "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
            headers: auth_header(valid_token)

        expect(response).to have_http_status(:unauthorized)
      end
    end

    it 'raises ActiveRecord::RecordNotFound when the domain id is unknown' do
      # set_domain uses .find, which raises RecordNotFound when no row
      # matches. The test env has show_exceptions=false so the exception
      # surfaces in the spec; production maps this to 404.
      expect {
        get "/api/v1/clients/#{client_record.id}/domains/0",
            headers: auth_header(valid_token)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'PUT /api/v1/clients/:client_id/domains/:id' do
    let!(:domain_record) do
      create(:domain, client: client_record, name: 'before.test')
    end
    let(:valid_attrs) { { domain: { name: 'after.test' } } }

    it 'updates the domain' do
      put "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
          params: valid_attrs,
          headers: auth_header(valid_token)

      expect(response).to have_http_status(:ok)
      expect(domain_record.reload.name).to eq('after.test')
      body = JSON.parse(response.body)
      expect(body.fetch('data')).to include('name' => 'after.test')
    end

    it 'responds 401 without an Authorization header' do
      put "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
          params: valid_attrs

      expect(response).to have_http_status(:unauthorized)
      expect(domain_record.reload.name).to eq('before.test')
    end

    context 'with a valid token but no update:domain scope' do
      let!(:full_authorization) do
        create(
          :client_auth,
          subject_id:    client_record.id,
          client_id:     client_record.id,
          membership_id: membership.id,
          user_id:       user.id,
          scopes:        [read_scope]
        )
      end

      it 'responds 401 (CanCan::AccessDenied)' do
        put "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
            params: valid_attrs,
            headers: auth_header(valid_token)

        expect(response).to have_http_status(:unauthorized)
        expect(domain_record.reload.name).to eq('before.test')
      end
    end

    it 'raises ActionController::ParameterMissing when the body is malformed' do
      # Domain has no model-level validations, so the only failure path for
      # a malformed PUT body is strong parameters. show_exceptions=false in
      # test, so the exception surfaces rather than rendering 400 -- see
      # the equivalent POST scenario above.
      expect {
        put "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
            params: {},
            headers: auth_header(valid_token)
      }.to raise_error(ActionController::ParameterMissing)

      expect(domain_record.reload.name).to eq('before.test')
    end
  end

  describe 'DELETE /api/v1/clients/:client_id/domains/:id' do
    let!(:domain_record) do
      create(:domain, client: client_record, name: 'doomed.test')
    end

    it 'destroys the domain' do
      expect {
        delete "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
               headers: auth_header(valid_token)
      }.to change(Domain, :count).by(-1)

      # The controller has no explicit render; Rails returns 204 No Content
      # for the implicit empty render of a destroy action with no template.
      expect(response).to have_http_status(:no_content)
    end

    it 'responds 401 without an Authorization header' do
      expect {
        delete "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}"
      }.not_to change(Domain, :count)

      expect(response).to have_http_status(:unauthorized)
    end

    context 'with a valid token but no destroy:domain scope' do
      let!(:full_authorization) do
        create(
          :client_auth,
          subject_id:    client_record.id,
          client_id:     client_record.id,
          membership_id: membership.id,
          user_id:       user.id,
          scopes:        [read_scope]
        )
      end

      it 'responds 401 (CanCan::AccessDenied)' do
        expect {
          delete "/api/v1/clients/#{client_record.id}/domains/#{domain_record.id}",
                 headers: auth_header(valid_token)
        }.not_to change(Domain, :count)

        expect(response).to have_http_status(:unauthorized)
      end
    end

    it 'raises ActiveRecord::RecordNotFound when the domain id is unknown' do
      expect {
        delete "/api/v1/clients/#{client_record.id}/domains/0",
               headers: auth_header(valid_token)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
