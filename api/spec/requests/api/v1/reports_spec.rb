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
#   * valid token with insufficient scope (rendered as 401 by
#     BaseController's rescue_from CanCan::AccessDenied — see NOTE below),
#   * validation failure (422).
#
# NOTE on 403 vs 401: BaseController rescues CanCan::AccessDenied with
# `status: :unauthorized` (401). The Secured concern also returns 401 for
# bad tokens. These specs assert what the API actually returns today: 401
# for both cases. The discriminator is the response body:
#   * invalid/missing token => 401, empty body
#   * insufficient scope    => 401, {"errors":"You are not authorized"}
#
# NOTE on ReportsController#current_ability: it reads
# `params[:project_id] || params[:report].fetch(:project_id, nil) || ...`.
# When neither `params[:project_id]` nor `params[:report]` is present this
# raises NoMethodError on the nil `params[:report]`. The specs route
# requests through forms that always supply `project_id` (URL or body) so
# the current_ability builder succeeds — matching how the controller is
# exercised in production and in the legacy controller spec.
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
        body = JSON.parse(response.body)
        expect(body).to have_key('data')
        ids = body['data'].map { |r| r['id'] }
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
        expect(JSON.parse(response.body)).to eq('data' => [])
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
        body = JSON.parse(response.body)
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
      it 'returns 401 with the not-authorized error envelope' do
        get "/api/v1/reports/#{report.id}", headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    context 'with a valid admin token but a non-existent report id' do
      before { make_user_admin! }

      it 'raises RecordNotFound (no spec-wide rescue, so the request errors)' do
        expect {
          get '/api/v1/reports/0', headers: headers
        }.to raise_error(ActiveRecord::RecordNotFound)
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
        expect {
          post '/api/v1/reports', params: valid_params.to_json, headers: headers
        }.to change { Report.count }.by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body.dig('data', 'name')).to eq('New Report')
        created_id = body.dig('data', 'id')

        get "/api/v1/reports/#{created_id}", headers: headers
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).dig('data', 'name')).to eq('New Report')
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
      it 'returns 401 with the not-authorized error envelope' do
        post '/api/v1/reports', params: valid_params.to_json, headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
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
        expect {
          post '/api/v1/reports', params: invalid_params.to_json, headers: headers
        }.not_to change { Report.count }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
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
        expect(JSON.parse(response.body).dig('data', 'name')).to eq('Updated Name')

        get "/api/v1/reports/#{report.id}", headers: headers
        expect(JSON.parse(response.body).dig('data', 'name')).to eq('Updated Name')
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
      it 'returns 401 with the not-authorized error envelope and leaves the report unchanged' do
        patch "/api/v1/reports/#{report.id}",
              params: update_params.to_json,
              headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
        expect(report.reload.name).to eq('Original Name')
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
        body = JSON.parse(response.body)
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
        expect {
          delete "/api/v1/reports/#{report.id}", headers: headers
        }.to change { Report.count }.by(-1)

        expect(response).to have_http_status(:ok)

        expect {
          get "/api/v1/reports/#{report.id}", headers: headers
        }.to raise_error(ActiveRecord::RecordNotFound)
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
      it 'returns 401 with the not-authorized error envelope and leaves the report intact' do
        expect {
          delete "/api/v1/reports/#{report.id}", headers: headers
        }.not_to change { Report.count }

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    # Destroy has no separate 422 case at the request-spec boundary: there's
    # no body to validate. Interactor failure modes are covered elsewhere.
  end

  describe 'GET /api/v1/reports/orphans' do
    let!(:report) { create(:report, project_id: project.id) }

    # `orphans` is a non-RESTful collection action, so
    # `load_and_authorize_resource` does not register a CanCan check for it
    # — the action body runs directly after Secured authentication. The
    # controller body's `current_ability` reference is only reached on the
    # non-admin branch (via `accessible_by(current_ability)`); the admin
    # path short-circuits before that. The `current_ability` builder
    # itself succeeds in both cases because ActionController param-wrapping
    # supplies an empty `:report` hash to satisfy the `.fetch` chain.

    context 'with a valid admin token (happy path)' do
      before { make_user_admin! }

      it 'returns 200 with an empty data array (admin short-circuit)' do
        get '/api/v1/reports/orphans', headers: headers

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq('data' => [])
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
        expect(JSON.parse(response.body)).to eq('data' => [])
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
      it 'returns 401 with the not-authorized error envelope' do
        post "/api/v1/reports/#{report.id}/authorize",
             params: authorize_params.to_json,
             headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
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
        body = JSON.parse(response.body)
        expect(body).to have_key('data')
        expect(body['data']).to be_an(Array)
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
      it 'returns 401 with the not-authorized error envelope' do
        get "/api/v1/reports/#{report.id}/authorized?project_id=#{project.id}",
            headers: headers

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)).to eq('errors' => 'You are not authorized')
      end
    end

    # `authorized` is a read-only listing; no request body, no 422 surface.
  end
end
