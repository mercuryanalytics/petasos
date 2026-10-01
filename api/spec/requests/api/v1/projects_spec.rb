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
#   * valid token with insufficient scope (403),
#   * validation failure (422).
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
        body = response.parsed_body
        expect(body).to have_key('data')
        names = body['data'].pluck('name')
        expect(names).to include(project.name, project_other.name)
      end

      it 'filters by client_id when provided' do
        get "/api/v1/projects?client_id=#{client.id}", headers: headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        ids = body['data'].pluck('id')
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
        body = response.parsed_body
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
        body = response.parsed_body
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
      it 'returns 403 with the not-authorized error envelope' do
        get "/api/v1/projects/#{project.id}", headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
      end
    end

    context 'with a valid admin token but a non-existent project id' do
      before { make_user_admin! }

      it 'returns 404' do
        get '/api/v1/projects/0', headers: headers

        expect(response).to have_http_status(:not_found)
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
        expect do
          post '/api/v1/projects', params: valid_params.to_json, headers: headers
        end.to change { Project.count }.by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body.dig('data', 'name')).to eq('New Project')
        created_id = body.dig('data', 'id')

        get "/api/v1/projects/#{created_id}", headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.dig('data', 'name')).to eq('New Project')
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
      it 'returns 403 with the not-authorized error envelope' do
        post '/api/v1/projects', params: valid_params.to_json, headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
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
        expect do
          post '/api/v1/projects', params: invalid_params.to_json, headers: headers
        end.not_to(change { Project.count })

        expect(response).to have_http_status(:unprocessable_entity)
        body = response.parsed_body
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
        expect(response.parsed_body.dig('data', 'name')).to eq('Updated Name')

        get "/api/v1/projects/#{project.id}", headers: headers
        expect(response.parsed_body.dig('data', 'name')).to eq('Updated Name')
      end
    end

    context 'when the params try to move the project to another client' do
      before { make_user_admin! }

      it 'ignores domain_id' do
        patch "/api/v1/projects/#{project.id}",
              params: { project: { name: 'Updated Name', domain_id: other_client.id } }.to_json,
              headers: headers

        expect(response).to have_http_status(:ok)
        expect(project.reload.domain_id).to eq(client.id)
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
      it 'returns 403 with the not-authorized error envelope and leaves the project unchanged' do
        patch "/api/v1/projects/#{project.id}",
              params: update_params.to_json,
              headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
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
        body = response.parsed_body
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
        expect do
          delete "/api/v1/projects/#{project.id}", headers: headers
        end.to change { Project.count }.by(-1)

        expect(response).to have_http_status(:ok)

        get "/api/v1/projects/#{project.id}", headers: headers
        expect(response).to have_http_status(:not_found)
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
      it 'returns 403 with the not-authorized error envelope and leaves the project intact' do
        expect do
          delete "/api/v1/projects/#{project.id}", headers: headers
        end.not_to(change { Project.count })

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
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
        body = response.parsed_body
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
        expect(response.parsed_body).to eq('data' => [])
      end
    end

    context 'with a valid token but no memberships' do
      before { membership.destroy! }

      it 'returns 200 with an empty data array' do
        get '/api/v1/projects/orphans', headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('data' => [])
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
      it 'returns 403 with the not-authorized error envelope' do
        post "/api/v1/projects/#{project.id}/authorize",
             params: authorize_params.to_json,
             headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
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
        body = response.parsed_body
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
      it 'returns 403 with the not-authorized error envelope' do
        get "/api/v1/projects/#{project.id}/authorized", headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
      end
    end

    # `authorized` is a read-only listing; no request body, no 422 surface.
  end
end
