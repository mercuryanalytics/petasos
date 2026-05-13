# frozen_string_literal: true

require 'rails_helper'

# Cross-cutting request spec for Api::V1::BaseController.
#
# BaseController is abstract; it has no routes of its own. To exercise its
# cross-cutting behavior end-to-end (the real HTTP boundary, the real
# MercurySsoAuth0/JsonWebToken verification path, the real CanCan rescue
# wiring) we drive it through a representative concrete subclass.
#
# Chosen endpoint: Api::V1::ClientsController.
#   - It inherits BaseController and includes the Secured concern at the
#     base-class level (so the 401-on-missing-token path goes through
#     BaseController's superclass chain identically to every other
#     controller).
#   - It calls both `json_response` (happy path: GET index, GET show) and
#     `error_response` (validation failure: POST with invalid params),
#     covering the two response-shape helpers BaseController defines.
#   - It uses load_and_authorize_resource, which is the dominant trigger of
#     the `rescue_from CanCan::AccessDenied` path in production.
#
# These specs intentionally focus on the *envelope shape* and the *status
# mapping* -- not the value of any particular resource field. Per the PRD
# user story 9, that keeps the specs stable under the Ruby 2.5 -> 3.3 and
# Rails 6.0 -> 7.x upgrades while still failing loudly if the API contract
# at this layer changes.
#
# The per-action coverage of ClientsController itself lives in
# spec/requests/api/v1/clients_spec.rb. The duplication is small and
# intentional: this file is the home for the cross-cutting assertions and
# can stay green even if a specific action's contract changes.
#
# Documented production-code quirk:
#   `rescue_from CanCan::AccessDenied` currently renders status
#   :unauthorized (HTTP 401), not :forbidden (HTTP 403). The PRD user-story
#   text speaks of an "insufficient scope -> 403" case; the production code
#   maps that to 401 today. These specs assert the observable behavior
#   (401) and a single comment flags the discrepancy for the upgrade work.
RSpec.describe 'Api::V1 cross-cutting behavior (BaseController)', type: :request do
  # See clients_spec.rb for the deadlock-avoidance rationale -- the Scope
  # model has no unique DB index, so concurrent INSERTs of the same
  # (scope, action) tuple can deadlock when sibling worktrees share the
  # petasos_test database.
  let(:admin_scope) do
    Scope.find_or_create_by(scope: 'user', action: 'admin')
  end
  let!(:admin_user) do
    create(:user, email: 'envelope-admin@example.test', auth_id: 'auth0|envelope-admin').tap do |u|
      u.scopes << admin_scope
    end
  end
  let!(:admin_membership) do
    create(:membership, user: admin_user, client: create(:client))
  end
  let!(:unprivileged_user) do
    create(:user, email: 'envelope-no-scope@example.test', auth_id: 'auth0|envelope-no-scope')
  end

  let(:admin_token) { mint_jwt(sub: admin_user.auth_id, email: admin_user.email) }
  let(:admin_headers) { auth_header(admin_token).merge('Content-Type' => 'application/json') }

  let(:unprivileged_token) do
    mint_jwt(sub: unprivileged_user.auth_id, email: unprivileged_user.email)
  end
  let(:unprivileged_headers) do
    auth_header(unprivileged_token).merge('Content-Type' => 'application/json')
  end

  let!(:client_record) { create(:client, name: 'EnvelopeCheck Co') }

  before do
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
  end

  describe 'success-response envelope (json_response)' do
    it 'wraps a collection under the `data` key with HTTP 200 and JSON content-type' do
      get '/api/v1/clients', headers: admin_headers

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to start_with('application/json')

      body = JSON.parse(response.body)
      expect(body).to be_a(Hash)
      expect(body.keys).to include('data')
      expect(body.fetch('data')).to be_an(Array)
    end

    it 'wraps a single resource under the `data` key' do
      get "/api/v1/clients/#{client_record.id}", headers: admin_headers

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to start_with('application/json')

      body = JSON.parse(response.body)
      expect(body.keys).to eq(['data'])
      expect(body.fetch('data')).to be_a(Hash)
    end
  end

  describe '401 mapping' do
    context 'missing token' do
      # Hits the Secured concern's `head :unauthorized` path -- no JSON body.
      # This documents that the missing-token branch returns a bare 401,
      # which is observably different from the CanCan::AccessDenied branch
      # below (which returns the `errors` envelope).
      it 'responds 401 with an empty body' do
        get '/api/v1/clients'

        expect(response).to have_http_status(:unauthorized)
        expect(response.body).to be_empty
      end
    end

    context 'invalid token' do
      it 'responds 401 with an empty body' do
        get '/api/v1/clients', headers: auth_header('not-a-real-jwt')

        expect(response).to have_http_status(:unauthorized)
        expect(response.body).to be_empty
      end
    end

    context 'authenticated but unauthorized (CanCan::AccessDenied)' do
      # See file-header note: production code currently maps
      # CanCan::AccessDenied to :unauthorized (401), not :forbidden (403).
      # The PRD's "403" wording is a future-state target; today's observable
      # behavior is 401 with the errors envelope.
      it 'responds 401 with the errors envelope' do
        get "/api/v1/clients/#{client_record.id}",
            headers: auth_header(unprivileged_token)

        expect(response).to have_http_status(:unauthorized)
        expect(response.content_type).to start_with('application/json')

        body = JSON.parse(response.body)
        expect(body).to have_key('errors')
        expect(body.fetch('errors')).to eq('You are not authorized')
      end
    end
  end

  describe '422 mapping (error_response)' do
    it 'responds 422 with the errors envelope when an interactor fails validation' do
      post '/api/v1/clients',
           params: { client: { name: '' } }.to_json,
           headers: admin_headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.content_type).to start_with('application/json')

      body = JSON.parse(response.body)
      expect(body).to have_key('errors')
      # The envelope value here is the ActiveModel::Errors object's JSON
      # representation (a hash of field -> messages). Asserting structural
      # shape, not specific copy, keeps this stable under i18n changes.
      expect(body.fetch('errors')).to be_a(Hash).or be_a(Array)
    end
  end

  describe 'ActiveRecord::RecordInvalid rescue (status mapping documented)' do
    # NOTE: BaseController has `rescue_from ActiveRecord::RecordInvalid` ->
    # 422, but no action in Api::V1 currently raises it -- every interactor
    # uses `save` (returning false) and routes through `error_response`
    # rather than `save!` (which would raise). The rescue is therefore dead
    # at the request boundary today. We assert the rescue is still
    # *configured* on the class as a guard against accidental removal
    # during the Rails upgrade. If a future action starts using `save!` or
    # `create!`, this rescue is what they will land on.
    it 'is configured on Api::V1::BaseController' do
      handlers = Api::V1::BaseController.rescue_handlers.map(&:first)
      expect(handlers).to include('ActiveRecord::RecordInvalid')
    end
  end
end
