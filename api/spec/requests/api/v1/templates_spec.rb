# frozen_string_literal: true

require 'rails_helper'

# Request spec for Api::V1::TemplatesController.
#
# Routes through the real auth path (JsonWebToken.verify -> Secured ->
# Users::GetCurrentUser) and the real ClientAbility CanCanCan rules. Only
# the JWKS HTTP fetch is stubbed. Per the PRD's testing decisions, the
# spec asserts externally observable behavior -- HTTP status and JSON body
# shape -- rather than internal interactor call sequence.
#
# Scenarios per action (per issue 005 acceptance criteria):
#   * authenticated happy path
#   * missing/invalid token (401)
#   * valid token with insufficient scope (rendered 401 in this codebase
#     -- BaseController/Secured both rescue CanCan::AccessDenied to
#     :unauthorized; the PRD's "(403)" labelling describes intent, the
#     status reflects observable behavior)
#   * validation failure on the body (422 from TemplateManager.fail!)
RSpec.describe 'Api::V1::Templates', type: :request do
  let!(:user) do
    create(:user, email: 'template-tester@example.test', auth_id: 'auth0|template-tester')
  end
  let!(:client_record) { create(:client) }
  let!(:membership) { create(:membership, user: user, client: client_record) }

  let(:authorize_scope) { create(:scope, :client, :authorize) }

  let!(:full_authorization) do
    create(
      :client_auth,
      subject_id:    client_record.id,
      client_id:     client_record.id,
      membership_id: membership.id,
      user_id:       user.id,
      scopes:        [authorize_scope]
    )
  end

  let(:valid_token) { mint_jwt(sub: user.auth_id, email: user.email) }

  before do
    # Rails 6 host authorization: test env allowlists only `localhost`.
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
  end

  describe 'GET /api/v1/clients/:client_id/templates' do
    let!(:project) { create(:project, client: client_record, name: 'Proj A') }
    let!(:report)  { create(:report, project: project, name: 'Rep A') }

    it 'returns the client template serialization for an authorized user' do
      get "/api/v1/clients/#{client_record.id}/templates",
          headers: auth_header(valid_token)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      data = body.fetch('data')
      expect(data).to include(
        'id'   => client_record.id,
        'name' => client_record.name
      )
      expect(data).to have_key('authorized')
      expect(data).to have_key('projects')
      expect(data).to have_key('roles')
      # The serializer always renders the project list -- this gives the
      # smoke-level shape assertion the request-spec layer is asked for.
      project_ids = data.fetch('projects').map { |p| p['id'] }
      expect(project_ids).to include(project.id)
    end

    it 'responds 401 when the Authorization header is missing' do
      get "/api/v1/clients/#{client_record.id}/templates"

      expect(response).to have_http_status(:unauthorized)
    end

    it 'responds 401 when the token signature does not match the JWKS' do
      attacker_key = OpenSSL::PKey::RSA.new(2048)
      bogus_token = mint_jwt_with(
        { sub: user.auth_id, email: user.email },
        { key: attacker_key }
      )

      get "/api/v1/clients/#{client_record.id}/templates",
          headers: auth_header(bogus_token)

      expect(response).to have_http_status(:unauthorized)
    end

    context 'with a valid token but no :authorize scope on the client' do
      let!(:full_authorization) do
        create(
          :client_auth,
          subject_id:    client_record.id,
          client_id:     client_record.id,
          membership_id: membership.id,
          user_id:       user.id,
          scopes:        [create(:scope, :client, :read)]
        )
      end

      it 'responds 401 (CanCan::AccessDenied)' do
        get "/api/v1/clients/#{client_record.id}/templates",
            headers: auth_header(valid_token)

        # before_action { authorize! :authorize, Client, id: ... } raises
        # CanCan::AccessDenied for any user lacking the `authorize` client
        # scope. BaseController rescues that to :unauthorized.
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/clients/:client_id/templates' do
    let(:add_params) do
      {
        resource_type: 'project',
        resource_id:   42,
        state:         1
      }
    end
    let(:remove_params) do
      {
        resource_type: 'project',
        resource_id:   42,
        state:         0
      }
    end

    it 'adds an authorization and returns 200 when state == 1' do
      expect {
        post "/api/v1/clients/#{client_record.id}/templates",
             params: add_params,
             headers: auth_header(valid_token)
      }.to change { Authorization.where(subject_class: 'Project', subject_id: 42, client_id: client_record.id).count }.by(1)

      expect(response).to have_http_status(:ok)
    end

    it 'removes an authorization and returns 204 when state == 0' do
      # Pre-seed the authorization so the remove branch has something to
      # destroy. Without it TemplateManager#remove_authorization returns
      # early for the new_record? case, which still yields :no_content.
      create(
        :authorization,
        subject_class: 'Project',
        subject_id:    42,
        client_id:     client_record.id
      )

      expect {
        post "/api/v1/clients/#{client_record.id}/templates",
             params: remove_params,
             headers: auth_header(valid_token)
      }.to change { Authorization.where(subject_class: 'Project', subject_id: 42, client_id: client_record.id).count }.by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it 'responds 401 when the Authorization header is missing' do
      expect {
        post "/api/v1/clients/#{client_record.id}/templates", params: add_params
      }.not_to change(Authorization, :count)

      expect(response).to have_http_status(:unauthorized)
    end

    it 'responds 401 when the token signature does not match the JWKS' do
      attacker_key = OpenSSL::PKey::RSA.new(2048)
      bogus_token = mint_jwt_with(
        { sub: user.auth_id, email: user.email },
        { key: attacker_key }
      )

      expect {
        post "/api/v1/clients/#{client_record.id}/templates",
             params: add_params,
             headers: auth_header(bogus_token)
      }.not_to change(Authorization, :count)

      expect(response).to have_http_status(:unauthorized)
    end

    context 'with a valid token but no :authorize scope on the client' do
      let!(:full_authorization) do
        create(
          :client_auth,
          subject_id:    client_record.id,
          client_id:     client_record.id,
          membership_id: membership.id,
          user_id:       user.id,
          scopes:        [create(:scope, :client, :read)]
        )
      end

      it 'responds 401 (CanCan::AccessDenied)' do
        expect {
          post "/api/v1/clients/#{client_record.id}/templates",
               params: add_params,
               headers: auth_header(valid_token)
        }.not_to change(Authorization, :count)

        expect(response).to have_http_status(:unauthorized)
      end
    end

    it 'responds 422 when required template params are missing' do
      # Clients::TemplateManager#call calls `context.fail!` when any of
      # client_id / resource_type / resource_id / state is missing from
      # the permitted params hash. BaseController#error_response renders
      # that as 422 with `{ errors: <message> }`. This is the assertable
      # validation-failure scenario for the create action.
      expect {
        post "/api/v1/clients/#{client_record.id}/templates",
             params: { resource_type: 'project' },
             headers: auth_header(valid_token)
      }.not_to change(Authorization, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body).to have_key('errors')
      expect(body['errors']).to match(/Not all attributes present/)
    end
  end
end
