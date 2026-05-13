# frozen_string_literal: true

require 'rails_helper'

# Request specs for Api::V1::ProjectsController.
#
# These specs go through the *real* HTTP boundary and the real auth path
# (JsonWebToken.verify -> Secured -> Users::GetCurrentUser -> CanCan
# ability resolution). Only the JWKS HTTP fetch is stubbed (via WebMock).
#
# Source of truth on auth helpers: spec/support/auth_helpers.rb. The legacy
# controller spec at spec/controllers/api/v1/projects_controller_spec.rb is
# retained and intentionally not modified.
#
# Per-action scenarios cover (per PRD user story 2):
#   * authenticated happy path,
#   * missing/invalid token (401),
#   * valid token with insufficient scope (rendered as 401 by
#     BaseController's rescue_from CanCan::AccessDenied — see NOTE below),
#   * validation failure (422).
#
# NOTE on 403 vs 401: the PRD user story phrases the insufficient-scope case
# as "403". The production BaseController, however, rescues
# CanCan::AccessDenied with `status: :unauthorized` (401) and the Secured
# concern also returns 401 for bad tokens. Because the hard constraint here
# is "no production code changes", these specs assert what the API actually
# returns today: 401 for both. The discriminator is the response body:
#   * invalid/missing token => 401, empty body (Secured#render_error =>
#     `head :unauthorized`)
#   * insufficient scope    => 401, body == {"errors":"You are not authorized"}
RSpec.describe 'Api::V1::Projects', type: :request do
  let!(:client) { create(:client) }
  let!(:other_client) { create(:client) }

  let(:user_email) { 'projects-request-user@example.test' }
  let(:user_auth_id) { 'auth0|projects-request-user' }

  let!(:user) { create(:user, email: user_email, auth_id: user_auth_id) }
  let!(:membership) { create(:membership, user: user, client: client) }

  let(:admin_scope) { create(:scope, action: 'admin', global: true) }

  let(:token) { mint_jwt(sub: user.auth_id, email: user.email) }
  let(:headers) { auth_header(token).merge('Content-Type' => 'application/json') }

  before do
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
  end

  # Promotes the test user to admin (scope action 'admin' => User#admin? true,
  # which short-circuits ProjectAbility#initialize to `can :manage, :all`).
  def make_user_admin!
    user.scopes << admin_scope
    user.instance_variable_set(:@admin, nil)
  end

  describe 'GET /api/v1/projects (index)' do
    let!(:project) { create(:project, client: client) }
    let!(:project_other) { create(:project, client: other_client) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with all projects in a data envelope' do
        get '/api/v1/projects', headers: headers

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body).to have_key('data')
        names = body['data'].map { |p| p['name'] }
        expect(names).to include(project.name, project_other.name)
      end

      it 'filters by client_id when provided' do
        get "/api/v1/projects?client_id=#{client.id}", headers: headers

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        ids = body['data'].map { |p| p['id'] }
        expect(ids).to include(project.id)
        expect(ids).not_to include(project_other.id)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get '/api/v1/projects'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get '/api/v1/projects', headers: auth_header('not-a-real-jwt')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but no admin/project authorizations' do
      # Non-admin with no project authorizations: ability has
      # `can :view, Project, id: []`, so accessible_by returns [].
      it 'returns 200 with an empty data collection (no projects visible)' do
        get '/api/v1/projects', headers: headers

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body).to eq('data' => [])
      end
    end
  end

  describe 'GET /api/v1/projects/:id (show)' do
    let!(:project) { create(:project, client: client) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with the requested project' do
        get "/api/v1/projects/#{project.id}", headers: headers

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body.dig('data', 'id')).to eq(project.id)
        expect(body.dig('data', 'name')).to eq(project.name)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/projects/#{project.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get "/api/v1/projects/#{project.id}", headers: auth_header('garbage.token.value')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but no authorization for this project' do
      # CanCan denies => BaseController rescues => 401 with the
      # "You are not authorized" envelope.
      it 'returns 401 with the not-authorized error envelope' do
        get "/api/v1/projects/#{project.id}", headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    context 'with a valid admin token but a non-existent project id' do
      before { make_user_admin! }

      it 'raises RecordNotFound (no spec-wide rescue, so the request errors)' do
        # ActiveRecord::RecordNotFound is not rescued by BaseController, so
        # the request raises out of the controller. We just confirm the
        # request did not 2xx silently with a fabricated record.
        expect {
          get '/api/v1/projects/0', headers: headers
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'POST /api/v1/projects (create)' do
    let(:valid_params) do
      {
        project: {
          name: 'New Project',
          description: 'A project under test',
          project_number: 'P-001',
          project_type: 'Custom Research',
          account_id: 'acct-1',
          domain_id: client.id
        }
      }
    end

    context 'with a valid admin token and valid params (happy path)' do
      before { make_user_admin! }

      it 'returns 201 and the created project is observable via GET' do
        expect {
          post '/api/v1/projects', params: valid_params.to_json, headers: headers
        }.to change { Project.count }.by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body.dig('data', 'name')).to eq('New Project')
        created_id = body.dig('data', 'id')

        get "/api/v1/projects/#{created_id}", headers: headers
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).dig('data', 'name')).to eq('New Project')
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        post '/api/v1/projects', params: valid_params.to_json,
                                 headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        post '/api/v1/projects', params: valid_params.to_json,
                                 headers: auth_header('not.a.jwt').merge('Content-Type' => 'application/json')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope to create' do
      # Non-admin user lacks `can :create, Project` in the ability.
      it 'returns 401 with the not-authorized error envelope' do
        post '/api/v1/projects', params: valid_params.to_json, headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    context 'with a valid admin token but invalid params (missing name)' do
      before { make_user_admin! }

      let(:invalid_params) do
        {
          project: {
            name: '',
            description: 'no name supplied',
            domain_id: client.id
          }
        }
      end

      it 'returns 422 with an errors envelope and does not create a project' do
        expect {
          post '/api/v1/projects', params: invalid_params.to_json, headers: headers
        }.not_to change { Project.count }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body).to have_key('errors')
      end
    end
  end

  describe 'PATCH /api/v1/projects/:id (update)' do
    let!(:project) { create(:project, client: client, name: 'Original Name') }

    let(:update_params) { { project: { name: 'Updated Name' } } }

    context 'with a valid admin token and valid params (happy path)' do
      before { make_user_admin! }

      it 'returns 200 and the change is observable via GET' do
        patch "/api/v1/projects/#{project.id}",
              params: update_params.to_json,
              headers: headers

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).dig('data', 'name')).to eq('Updated Name')

        get "/api/v1/projects/#{project.id}", headers: headers
        expect(JSON.parse(response.body).dig('data', 'name')).to eq('Updated Name')
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        patch "/api/v1/projects/#{project.id}",
              params: update_params.to_json,
              headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        patch "/api/v1/projects/#{project.id}",
              params: update_params.to_json,
              headers: auth_header('bogus').merge('Content-Type' => 'application/json')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope to update' do
      it 'returns 401 with the not-authorized error envelope and leaves the project unchanged' do
        patch "/api/v1/projects/#{project.id}",
              params: update_params.to_json,
              headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
        expect(project.reload.name).to eq('Original Name')
      end
    end

    context 'with a valid admin token but invalid params (blank name)' do
      before { make_user_admin! }

      let(:invalid_params) { { project: { name: '' } } }

      it 'returns 422 and does not persist the change' do
        patch "/api/v1/projects/#{project.id}",
              params: invalid_params.to_json,
              headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body).to have_key('errors')
        expect(project.reload.name).to eq('Original Name')
      end
    end
  end

  describe 'DELETE /api/v1/projects/:id (destroy)' do
    let!(:project) { create(:project, client: client) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 and the project is no longer reachable via GET' do
        expect {
          delete "/api/v1/projects/#{project.id}", headers: headers
        }.to change { Project.count }.by(-1)

        expect(response).to have_http_status(:ok)

        expect {
          get "/api/v1/projects/#{project.id}", headers: headers
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        delete "/api/v1/projects/#{project.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        delete "/api/v1/projects/#{project.id}", headers: auth_header('nope')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope to destroy' do
      it 'returns 401 with the not-authorized error envelope and leaves the project intact' do
        expect {
          delete "/api/v1/projects/#{project.id}", headers: headers
        }.not_to change { Project.count }

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    # Destroy has no separate 422 case at the request-spec boundary: there's
    # no body to validate. The interactor's failure mode (RemoveAuthorization
    # raises, RemoveProject fails) is covered by interactor specs, not here.
  end

  describe 'GET /api/v1/projects/orphans' do
    let!(:owned_project)   { create(:project, client: client) }
    let!(:orphan_project)  { create(:project, client: other_client) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      # `orphans` early-returns `[]` for admins. The data envelope confirms
      # the route + auth + ability resolution all wired up correctly.
      it 'returns 200 with a data envelope' do
        get '/api/v1/projects/orphans', headers: headers

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body).to have_key('data')
        expect(body['data']).to eq([])
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get '/api/v1/projects/orphans'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get '/api/v1/projects/orphans', headers: auth_header('not-jwt')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but no project authorizations' do
      # `orphans` is class-scoped (no :id in the URL). CanCan permits class-
      # level :orphans because the ability allows `:view` on Project with an
      # id filter — i.e. "you might be able to view some Project somewhere".
      # The controller's own logic then filters down to the empty set for a
      # non-admin with no client authorizations. Asserting the externally
      # observable contract: 200 with `data: []` rather than a 401.
      it 'returns 200 with an empty data array' do
        get '/api/v1/projects/orphans', headers: headers

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq('data' => [])
      end
    end
  end

  describe 'POST /api/v1/projects/:id/authorize' do
    let!(:project) { create(:project, client: client) }
    let!(:other_user) { create(:user, email: 'other@example.test') }
    let!(:other_membership) { create(:membership, user: other_user, client: client) }

    let(:authorize_params) do
      {
        user_id: other_user.id,
        client_id: client.id,
        authorize: true,
        role: 'reader',
        role_state: true,
        from_admin: true
      }
    end

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 201 (or 204 when the authorization is a no-op)' do
        post "/api/v1/projects/#{project.id}/authorize",
             params: authorize_params.to_json,
             headers: headers

        expect([201, 204]).to include(response.status)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        post "/api/v1/projects/#{project.id}/authorize",
             params: authorize_params.to_json,
             headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        post "/api/v1/projects/#{project.id}/authorize",
             params: authorize_params.to_json,
             headers: auth_header('bad').merge('Content-Type' => 'application/json')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope' do
      it 'returns 401 with the not-authorized error envelope' do
        post "/api/v1/projects/#{project.id}/authorize",
             params: authorize_params.to_json,
             headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    # The `authorize` action does no Rails parameter validation that would
    # surface as 422 at this layer — the interactor branches on presence,
    # not validity. Validation-failure semantics for this endpoint are
    # interactor-level (Authorizations::*), tested elsewhere.
  end

  describe 'GET /api/v1/projects/:id/authorized' do
    let!(:project) { create(:project, client: client) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with a data envelope of users' do
        get "/api/v1/projects/#{project.id}/authorized", headers: headers

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body).to have_key('data')
        expect(body['data']).to be_an(Array)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/projects/#{project.id}/authorized"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get "/api/v1/projects/#{project.id}/authorized", headers: auth_header('nope')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope' do
      it 'returns 401 with the not-authorized error envelope' do
        get "/api/v1/projects/#{project.id}/authorized", headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    # `authorized` is a read-only listing; no request body, no 422 surface.
  end
end
