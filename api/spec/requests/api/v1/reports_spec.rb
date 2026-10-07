# frozen_string_literal: true

require 'rails_helper'

# Request specs for Api::V1::ReportsController.
#
# These specs go through the *real* HTTP boundary and the real auth path
# (JsonWebToken.verify -> Secured -> Users::GetCurrentUser -> CanCan
# ability resolution). Only the JWKS HTTP fetch is stubbed (via WebMock).
#
# Source of truth on auth helpers: spec/support/auth_helpers.rb. The legacy
# controller spec at spec/controllers/api/v1/reports_controller_spec.rb is
# retained and intentionally not modified.
#
# Per-action scenarios cover (per PRD user story 2):
#   * authenticated happy path,
#   * missing/invalid token (401),
#   * valid token with insufficient scope (403),
#   * validation failure (422).
#
RSpec.describe 'Api::V1::Reports', type: :request do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:other_project) { create(:project, client: create(:client)) }

  let(:user_email) { 'reports-request-user@example.test' }
  let(:user_auth_id) { 'auth0|reports-request-user' }

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

  def make_user_admin!
    user.scopes << admin_scope
    user.instance_variable_set(:@admin, nil)
  end

  describe 'GET /api/v1/reports (index)' do
    let!(:report)        { create(:report, project_id: project.id) }
    let!(:report_other)  { create(:report, project_id: other_project.id) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with the reports for a given project_id' do
        get "/api/v1/reports?project_id=#{project.id}", headers: headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('data')
        ids = body['data'].pluck('id')
        expect(ids).to include(report.id)
        expect(ids).not_to include(report_other.id)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/reports?project_id=#{project.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get "/api/v1/reports?project_id=#{project.id}",
            headers: auth_header('not-a-real-jwt')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but no report authorizations' do
      # Non-admin with no report authorizations: ability allows
      # `:view` on Report restricted to ids = []. Class-scoped :index passes
      # CanCan (the class-level check is permissive when *any* matching rule
      # exists), and the controller filters to empty.
      it 'returns 200 with an empty data array' do
        get "/api/v1/reports?project_id=#{project.id}", headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('data' => [])
      end
    end

    context 'with a valid token, a client_id, and no memberships' do
      let!(:report) { create(:report, project_id: project.id) }

      before { membership.destroy! }

      it 'returns 200 with an empty data array' do
        get "/api/v1/reports?client_id=#{client.id}", headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('data' => [])
      end
    end
  end

  describe 'GET /api/v1/reports/:id (show)' do
    let!(:report) { create(:report, project_id: project.id) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with the requested report' do
        get "/api/v1/reports/#{report.id}", headers: headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body.dig('data', 'id')).to eq(report.id)
        expect(body.dig('data', 'name')).to eq(report.name)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/reports/#{report.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get "/api/v1/reports/#{report.id}", headers: auth_header('bogus.jwt.value')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but no authorization for this report' do
      it 'returns 403 with the not-authorized error envelope' do
        get "/api/v1/reports/#{report.id}", headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
      end
    end

    context 'with a valid admin token but a non-existent report id' do
      before { make_user_admin! }

      it 'returns 404' do
        get '/api/v1/reports/0', headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/reports (create)' do
    let(:valid_params) do
      {
        report: {
          name: 'New Report',
          description: 'A report under test',
          url: 'http://example.test/report',
          project_id: project.id
        }
      }
    end

    context 'with a valid admin token and valid params (happy path)' do
      before { make_user_admin! }

      it 'returns 201 and the created report is observable via GET' do
        expect do
          post '/api/v1/reports', params: valid_params.to_json, headers: headers
        end.to change { Report.count }.by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body.dig('data', 'name')).to eq('New Report')
        created_id = body.dig('data', 'id')

        get "/api/v1/reports/#{created_id}", headers: headers
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.dig('data', 'name')).to eq('New Report')
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        post '/api/v1/reports',
             params: valid_params.to_json,
             headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        post '/api/v1/reports',
             params: valid_params.to_json,
             headers: auth_header('nope').merge('Content-Type' => 'application/json')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope to create' do
      # Non-admin without `can :create, Report` on this project.
      it 'returns 403 with the not-authorized error envelope' do
        post '/api/v1/reports', params: valid_params.to_json, headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
      end
    end

    context 'with a valid admin token but invalid params (missing name)' do
      before { make_user_admin! }

      let(:invalid_params) do
        {
          report: {
            name: '',
            description: 'no name supplied',
            project_id: project.id
          }
        }
      end

      it 'returns 422 with an errors envelope and does not create a report' do
        expect do
          post '/api/v1/reports', params: invalid_params.to_json, headers: headers
        end.not_to(change { Report.count })

        expect(response).to have_http_status(:unprocessable_entity)
        body = response.parsed_body
        expect(body).to have_key('errors')
      end
    end
  end

  describe 'PATCH /api/v1/reports/:id (update)' do
    let!(:report) { create(:report, project_id: project.id, name: 'Original Name') }

    let(:update_params) { { report: { name: 'Updated Name', project_id: project.id } } }

    context 'with a valid admin token and valid params (happy path)' do
      before { make_user_admin! }

      it 'returns 200 and the change is observable via GET' do
        patch "/api/v1/reports/#{report.id}",
              params: update_params.to_json,
              headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.dig('data', 'name')).to eq('Updated Name')

        get "/api/v1/reports/#{report.id}", headers: headers
        expect(response.parsed_body.dig('data', 'name')).to eq('Updated Name')
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        patch "/api/v1/reports/#{report.id}",
              params: update_params.to_json,
              headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        patch "/api/v1/reports/#{report.id}",
              params: update_params.to_json,
              headers: auth_header('not.a.real.jwt').merge('Content-Type' => 'application/json')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope to update' do
      it 'returns 403 with the not-authorized error envelope and leaves the report unchanged' do
        patch "/api/v1/reports/#{report.id}",
              params: update_params.to_json,
              headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
        expect(report.reload.name).to eq('Original Name')
      end
    end

    context 'when the params try to move the report to a project in another client' do
      before do
        client_authorization = Authorization.create!(membership: membership, subject_class: 'Client', subject_id: client.id)
        client_authorization.scopes << create(:scope, :client, :update)
      end

      it 'ignores project_id' do
        patch "/api/v1/reports/#{report.id}",
              params: { report: { name: 'Updated Name', project_id: other_project.id } }.to_json,
              headers: headers

        expect(response).to have_http_status(:ok)
        expect(report.reload.project_id).to eq(project.id)
      end
    end

    context 'with a valid admin token but invalid params (blank name)' do
      before { make_user_admin! }

      let(:invalid_params) { { report: { name: '', project_id: project.id } } }

      it 'returns 422 and does not persist the change' do
        patch "/api/v1/reports/#{report.id}",
              params: invalid_params.to_json,
              headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        body = response.parsed_body
        expect(body).to have_key('errors')
        expect(report.reload.name).to eq('Original Name')
      end
    end
  end

  describe 'DELETE /api/v1/reports/:id (destroy)' do
    let!(:report) { create(:report, project_id: project.id) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 and the report is no longer reachable via GET' do
        expect do
          delete "/api/v1/reports/#{report.id}", headers: headers
        end.to change { Report.count }.by(-1)

        expect(response).to have_http_status(:ok)

        get "/api/v1/reports/#{report.id}", headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        delete "/api/v1/reports/#{report.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        delete "/api/v1/reports/#{report.id}", headers: auth_header('garbage')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope to destroy' do
      it 'returns 403 with the not-authorized error envelope and leaves the report intact' do
        expect do
          delete "/api/v1/reports/#{report.id}", headers: headers
        end.not_to(change { Report.count })

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
      end
    end

    # Destroy has no separate 422 case at the request-spec boundary: there's
    # no body to validate. Interactor failure modes are covered elsewhere.
  end

  describe 'GET /api/v1/reports/orphans' do
    let!(:report) { create(:report, project_id: project.id) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with an empty data array (admin short-circuit)' do
        get '/api/v1/reports/orphans', headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('data' => [])
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get '/api/v1/reports/orphans'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get '/api/v1/reports/orphans', headers: auth_header('definitely-not-a-jwt')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but no project / client authorizations' do
      # Non-admin reaches `accessible_by(current_ability)`. With no
      # authorizations the ability resolves to an empty result set — 200
      # with an empty data array, not a 401. This is the externally
      # observable contract: the user simply sees no orphans.
      it 'returns 200 with an empty data array' do
        get '/api/v1/reports/orphans', headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('data' => [])
      end

      # Without a JSON Content-Type, wrap_parameters adds no `:report` key.
      it 'returns 200 when the request has no Content-Type' do
        get '/api/v1/reports/orphans', headers: auth_header(token)

        expect(response).to have_http_status(:ok)
      end
    end

    context 'with a valid token but no memberships' do
      before { membership.destroy! }

      it 'returns 200 with an empty data array' do
        get '/api/v1/reports/orphans', headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('data' => [])
      end
    end
  end

  describe 'POST /api/v1/reports/:id/authorize' do
    let!(:report) { create(:report, project_id: project.id) }
    let!(:other_user) { create(:user, email: 'other@example.test') }
    let!(:other_membership) { create(:membership, user: other_user, client: client) }

    let(:authorize_params) do
      {
        user_id: other_user.id,
        client_id: client.id,
        authorize: true,
        role: 'reader',
        role_state: true,
        from_admin: true,
        # current_ability requires either params[:project_id] or
        # params[:report] to be present; include the report key so the
        # ability builder succeeds.
        report: { project_id: project.id }
      }
    end

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 201 (or 204 when the authorization is a no-op)' do
        post "/api/v1/reports/#{report.id}/authorize",
             params: authorize_params.to_json,
             headers: headers

        expect([201, 204]).to include(response.status)
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        post "/api/v1/reports/#{report.id}/authorize",
             params: authorize_params.to_json,
             headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        post "/api/v1/reports/#{report.id}/authorize",
             params: authorize_params.to_json,
             headers: auth_header('bad').merge('Content-Type' => 'application/json')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope' do
      it 'returns 403 with the not-authorized error envelope' do
        post "/api/v1/reports/#{report.id}/authorize",
             params: authorize_params.to_json,
             headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
      end
    end

    # The `authorize` action does no Rails parameter validation that would
    # surface as 422 at this layer. Validation-failure semantics for this
    # endpoint are interactor-level, tested elsewhere.
  end

  describe 'GET /api/v1/reports/:id/authorized' do
    let!(:report) { create(:report, project_id: project.id) }

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with a data envelope of users' do
        # current_ability requires project_id or params[:report]; supply via
        # query string to satisfy the chain in the controller.
        get "/api/v1/reports/#{report.id}/authorized?project_id=#{project.id}",
            headers: headers

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('data')
        expect(body['data']).to be_an(Array)
      end

      context 'with users authorized through memberships' do
        let!(:other_client) { create(:client) }
        let!(:reader) { create(:user, email: 'reader@example.test') }
        let!(:reader_membership) { create(:membership, user: reader, client: client) }
        let!(:reader_other_membership) { create(:membership, user: reader, client: other_client) }
        let!(:bystander) { create(:user, email: 'bystander@example.test') }
        let!(:bystander_membership) { create(:membership, user: bystander, client: client) }

        before do
          create(:report_auth, subject_id: report.id, membership_id: reader_membership.id)
        end

        it 'without client_id, lists every user with the client ids of their authorized memberships' do
          get "/api/v1/reports/#{report.id}/authorized", headers: headers

          expect(response).to have_http_status(:ok)
          expect(response.parsed_body['data'].size).to eq(3)
          expect(authorized_for('reader@example.test')).to eq([client.id])
          expect(authorized_for('bystander@example.test')).to eq([])
          expect(authorized_for(user_email)).to eq([])
        end

        it 'with client_id, lists that client\'s users with a boolean' do
          get "/api/v1/reports/#{report.id}/authorized?client_id=#{client.id}", headers: headers

          expect(response).to have_http_status(:ok)
          expect(response.parsed_body['data'].size).to eq(3)
          expect(authorized_for('reader@example.test')).to be(true)
          expect(authorized_for('bystander@example.test')).to be(false)
        end

        it 'without client_id, does not run a query per authorized user' do
          baseline = count_queries { get "/api/v1/reports/#{report.id}/authorized", headers: headers }

          3.times do |i|
            extra = create(:user, email: "extra#{i}@example.test")
            extra_membership = create(:membership, user: extra, client: client)
            create(:report_auth, subject_id: report.id, membership_id: extra_membership.id)
          end

          with_more_users = count_queries { get "/api/v1/reports/#{report.id}/authorized", headers: headers }

          expect(with_more_users).to eq(baseline)
        end
      end
    end

    context 'with no Authorization header' do
      it 'returns 401' do
        get "/api/v1/reports/#{report.id}/authorized?project_id=#{project.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid token' do
      it 'returns 401' do
        get "/api/v1/reports/#{report.id}/authorized?project_id=#{project.id}",
            headers: auth_header('nope')

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with a valid token but insufficient scope' do
      it 'returns 403 with the not-authorized error envelope' do
        get "/api/v1/reports/#{report.id}/authorized?project_id=#{project.id}",
            headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(response.parsed_body).to eq('errors' => 'You are not authorized')
      end
    end

    # `authorized` is a read-only listing; no request body, no 422 surface.
  end
end
