# frozen_string_literal: true

require 'rails_helper'

# Auth integration spec — exercises the *real* JWT verification path
# (JsonWebToken.verify -> Secured -> Users::GetCurrentUser) end-to-end
# against a representative protected endpoint. Only the JWKS HTTP fetch is
# stubbed via WebMock; verification, key lookup, claim checks, and user
# resolution all flow through production code.
#
# `/api/v1/scopes` is used as the representative protected endpoint because
# `Api::V1::ScopesController` is the simplest controller that mounts the
# `Secured` concern -- a successful authenticated request returns a tiny,
# easily-asserted JSON body and the controller has no params, no DB writes,
# and no cross-resource setup.
RSpec.describe 'Auth integration', type: :request do
  let(:protected_path) { '/api/v1/scopes' }
  let!(:user) { create(:user, email: 'integration-user@example.test', auth_id: 'auth0|integration-test') }

  before do
    # The test env only allowlists `localhost` in `config.hosts` (see
    # config/environments/test.rb). Request specs default to www.example.com,
    # which Rails 6 host authorization blocks with a 403 -- masking the auth
    # response. Match the prior-art pattern in spec/requests/up_spec.rb.
    host! 'localhost'
    stub_jwt_issuer_and_audience!
    stub_jwks_endpoint!
  end

  describe 'with a valid token' do
    let(:token) do
      mint_jwt(
        sub: user.auth_id,
        email: user.email
      )
    end

    it 'authorizes the request and resolves the current user' do
      get protected_path, headers: auth_header(token)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      # Non-admin user => ScopesController#index returns `data: []`.
      # This proves the request reached the controller and current_user was
      # resolved (otherwise the Secured concern would have rendered 401
      # before the controller body ran).
      expect(body).to eq('data' => [])
    end
  end

  describe 'with no Authorization header' do
    it 'responds 401' do
      get protected_path

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'with an invalid signature' do
    let(:other_key) { OpenSSL::PKey::RSA.new(2048) }
    let(:token) do
      # Token signed with a key the JWKS does NOT advertise.
      mint_jwt_with(
        { sub: user.auth_id, email: user.email },
        { key: other_key }
      )
    end

    it 'responds 401' do
      get protected_path, headers: auth_header(token)

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'with an expired token' do
    let(:token) do
      mint_jwt(
        sub: user.auth_id,
        email: user.email,
        iat: Time.now.to_i - 7200,
        exp: Time.now.to_i - 3600
      )
    end

    it 'responds 401' do
      get protected_path, headers: auth_header(token)

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'with a wrong issuer' do
    let(:token) do
      mint_jwt(
        sub: user.auth_id,
        email: user.email,
        iss: 'https://attacker.example.test/'
      )
    end

    it 'responds 401' do
      get protected_path, headers: auth_header(token)

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'with a wrong audience' do
    let(:token) do
      mint_jwt(
        sub: user.auth_id,
        email: user.email,
        aud: 'some-other-audience'
      )
    end

    # NOTE: JsonWebToken.verify is currently called with `verify_aud: false`
    # (see app/lib/json_web_token.rb -- the production code carries a TODO
    # comment about flipping this on). This example documents that observable
    # behavior: a wrong audience currently does NOT cause a 401. When the
    # production code is fixed to enforce audience verification, flip the
    # expectation to `:unauthorized` and remove the `pending` marker.
    it 'currently allows the request (production code has verify_aud: false)' do
      pending 'JsonWebToken.verify has verify_aud: false -- enable to enforce audience'
      get protected_path, headers: auth_header(token)

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'with an unknown kid' do
    # Defensive case: the JWKS lookup returns nil when the kid is not found,
    # which trips JWT::DecodeError inside the verifier. This isn't strictly
    # listed in the acceptance criteria but is the natural Auth0-rotation
    # failure mode, and the Secured concern handles it identically.
    let(:token) do
      mint_jwt_with(
        { sub: user.auth_id, email: user.email },
        { kid: 'unknown-kid' }
      )
    end

    it 'responds 401' do
      get protected_path, headers: auth_header(token)

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
