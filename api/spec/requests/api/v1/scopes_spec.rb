# frozen_string_literal: true

require 'rails_helper'

# Request spec for Api::V1::ScopesController.
#
# ScopesController has a single action -- #index -- that returns the catalog
# of global/dynamic Scope records when called by an admin, and an empty
# collection otherwise. Auth flows through the real `Secured` concern via the
# Issue 001 helpers; no Auth0 HTTP is reached for this controller, so only the
# JWKS endpoint is stubbed.
RSpec.describe 'Api::V1::ScopesController', type: :request do
  let(:path) { '/api/v1/scopes' }
  let!(:user) do
    create(:user, email: 'scopes-request@example.test', auth_id: 'auth0|scopes-request')
  end

  before do
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
  end

  describe 'GET /api/v1/scopes' do
    describe 'authenticated happy path (admin)' do
      let!(:admin_scope) { create(:scope, :user, :admin, global: true) }
      let!(:global_scope) { create(:scope, :client, :read, global: true) }
      let!(:dynamic_scope) do
        Scope.create!(scope: 'clients', action: 'view', dynamic: true, global: false)
      end
      let(:token) { mint_jwt(sub: user.auth_id, email: user.email) }

      before { user.scopes << admin_scope }

      it 'returns the global and dynamic scope catalog' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body).to have_key('data')
        expect(body['data']).to have_key('global')
        expect(body['data']).to have_key('dynamic')

        global_ids = body['data']['global'].map { |s| s['id'] }
        dynamic_ids = body['data']['dynamic'].map { |s| s['id'] }
        expect(global_ids).to include(admin_scope.id, global_scope.id)
        expect(dynamic_ids).to include(dynamic_scope.id)
      end
    end

    describe 'authenticated happy path (non-admin)' do
      let(:token) { mint_jwt(sub: user.auth_id, email: user.email) }

      it 'returns an empty data array (controller short-circuits non-admins)' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body).to eq('data' => [])
      end
    end

    describe 'missing token' do
      it 'responds 401' do
        get path

        expect(response).to have_http_status(:unauthorized)
      end
    end

    describe 'invalid token (bad signature)' do
      let(:other_key) { OpenSSL::PKey::RSA.new(2048) }
      let(:token) do
        mint_jwt_with(
          { sub: user.auth_id, email: user.email },
          { key: other_key }
        )
      end

      it 'responds 401' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:unauthorized)
      end
    end

    describe 'token for an unknown user (no User record matches the JWT)' do
      # The `Secured` concern resolves the JWT's email/sub into a User via
      # Users::GetCurrentUser. When that interactor fails because no matching
      # Domain exists for an unknown user's email, it raises UserNotFoundError,
      # which Secured maps to 401. This is the spec's "insufficient scope /
      # forbidden identity" analog for an endpoint whose only authorization
      # check is "are you an admin?": a non-resolvable identity is rejected at
      # the auth boundary before ever reaching authorization.
      let(:token) do
        mint_jwt(sub: 'auth0|nobody', email: 'nobody@unknown-domain.test')
      end

      it 'responds 401' do
        get path, headers: auth_header(token)

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
