# frozen_string_literal: true

require 'rails_helper'

# Request spec for Api::V1::PasswordResetController -- the Auth0-backed
# password-reset flow.
#
# Coverage:
#   * authenticated happy path is N/A in the auth sense: the controller
#     extends ApplicationController (= ActionController::API) directly and
#     does NOT include the Secured / MercurySsoAuth0::Authenticated concern.
#     All four actions are intentionally unauthenticated -- the routes are
#     hit by unauthenticated visitors clicking the "forgot password" link.
#     The happy-path examples therefore exercise the endpoints with no
#     Authorization header.
#   * missing/invalid token (401) is N/A for the same reason -- no
#     Authorization header is ever required.
#   * insufficient scope (403) is N/A for the same reason -- there is no
#     authorization layer to fail.
#   * validation failure (422) IS covered: each action has user-supplied
#     param paths that return 422 (or, where the controller uses other 4xx
#     codes for invalid input, those codes -- 404 / 417 -- are asserted).
#
# All outbound Auth0 HTTP calls (token endpoint + management API) are
# stubbed via WebMock, matching the constraint that the suite must run
# offline. The controller reaches Auth0 indirectly via Users::GetAuth0User,
# Users::CreateAuth0User, and Users::UpdateAuth0User -- each of which hits
# RestClient under the hood and is therefore covered by the same WebMock
# stubs.
RSpec.describe 'Api::V1::PasswordReset', type: :request do
  let(:create_path) { '/api/v1/reset-password' }
  let(:update_path) { '/api/v1/change-password' }
  let(:verify_path) { '/api/v1/verify-password-token' }
  let(:resend_path) { '/api/v1/resend-password-token' }

  # Match the test-time credentials seen via `bundle exec rails runner` so
  # WebMock host matchers stay aligned with what Auth0::UserManagementToken
  # and the Users::*Auth0User interactors build.
  let(:auth0_base_url) { 'https://auth.researchresultswebsite.com/' }
  let(:auth0_token_endpoint) { "#{auth0_base_url}oauth/token" }
  let(:auth0_users_endpoint) { "#{auth0_base_url}api/v2/users" }
  let(:auth0_users_by_email_endpoint) { "#{auth0_base_url}api/v2/users-by-email" }

  before do
    # The test env only allowlists `localhost` in config.hosts; without
    # `host! 'localhost'` Rails 6 returns 403 from host authorization,
    # masking the real response (prior art: spec/requests/auth_integration_spec.rb).
    host! 'localhost'
    # Always stub the management-API token endpoint -- every Auth0 call the
    # controller makes goes through Auth0::UserManagementToken.call first.
    # Rails cache is :null_store in test so the token is re-requested each
    # call; we keep this stub broad and counted only where it matters.
    stub_request(:post, auth0_token_endpoint).to_return(
      status:  200,
      body:    { access_token: 'test-mgmt-token', expires_in: 3600 }.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
  end

  describe 'POST /api/v1/reset-password (create)' do
    context 'when the email matches no User' do
      it 'returns 201 with the generic done message (no enumeration)' do
        post create_path, params: { email: 'unknown@example.test' }

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body).to eq('data' => { 'message' => 'done' })
      end

      it 'does not call Auth0 when no user matches' do
        post create_path, params: { email: 'unknown@example.test' }

        expect(WebMock).not_to have_requested(:get, /#{Regexp.escape(auth0_users_by_email_endpoint)}/)
        expect(WebMock).not_to have_requested(:post, auth0_users_endpoint)
      end
    end

    context 'when the user exists and already has an auth0 auth_id' do
      let!(:user) do
        create(
          :user,
          email:   'has-auth0@example.test',
          auth_id: 'auth0|existing-user'
        )
      end

      it 'returns 201, sets a reset token, and delivers the mailer' do
        ActionMailer::Base.deliveries.clear

        expect {
          post create_path, params: { email: user.email, subdomain: 'acme' }
        }.to change { ActionMailer::Base.deliveries.size }.by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body).to eq('data' => { 'message' => 'done' })

        user.reload
        expect(user.password_reset_token).to be_present
        expect(user.password_reset_expires_at).to be_present
        expect(user.password_reset_domain).to eq('acme')

        delivered = ActionMailer::Base.deliveries.last
        expect(delivered.to).to eq([user.email])
        expect(delivered.subject).to eq('Reset your password')
      end

      it 'does not call Auth0 when the user already has an auth_id' do
        post create_path, params: { email: user.email }

        expect(WebMock).not_to have_requested(:get, /#{Regexp.escape(auth0_users_by_email_endpoint)}/)
      end
    end

    context 'when the user exists but has no auth_id, and Auth0 has the user' do
      let!(:user) { create(:user, email: 'no-auth-id@example.test', auth_id: nil) }

      before do
        stub_request(:get, /#{Regexp.escape(auth0_users_by_email_endpoint)}/).to_return(
          status:  200,
          body:    [{ user_id: 'auth0|backfilled-id' }].to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      end

      it 'backfills auth_id from Auth0 and returns 201' do
        post create_path, params: { email: user.email }

        expect(response).to have_http_status(:created)
        user.reload
        expect(user.auth_id).to eq('auth0|backfilled-id')
        expect(user.password_reset_token).to be_present
      end
    end

    context 'when the user exists, has no auth_id, and Auth0 does not have the user' do
      let!(:user) { create(:user, email: 'creates-auth0@example.test', auth_id: nil) }

      before do
        # Empty body => Users::GetAuth0User fails => CreateAuth0User runs.
        stub_request(:get, /#{Regexp.escape(auth0_users_by_email_endpoint)}/).to_return(
          status:  200,
          body:    [].to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
        stub_request(:post, auth0_users_endpoint).to_return(
          status:  201,
          body:    { user_id: 'auth0|newly-created-id' }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      end

      it 'creates the Auth0 user, backfills auth_id, and returns 201' do
        post create_path, params: { email: user.email }

        expect(response).to have_http_status(:created)
        user.reload
        expect(user.auth_id).to eq('auth0|newly-created-id')
        expect(user.password_reset_token).to be_present
      end
    end
  end

  describe 'POST /api/v1/change-password (update)' do
    let!(:user) do
      create(
        :user,
        email:                     'reset-me@example.test',
        auth_id:                   'auth0|reset-me',
        password_reset_token:      'valid-reset-token',
        password_reset_expires_at: 1.day.from_now,
        password_reset_domain:     'acme'
      )
    end

    context 'with a valid token and matching passwords (happy path)' do
      before do
        # Users::UpdateAuth0User PATCHes /api/v2/users/<auth_id>.
        stub_request(:patch, "#{auth0_base_url}api/v2/users/#{user.auth_id}").to_return(
          status:  200,
          body:    { email: user.email }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      end

      it 'returns 201 and clears the reset fields' do
        post update_path, params: {
          token:                 'valid-reset-token',
          password:              'newsecret123!',
          password_confirmation: 'newsecret123!'
        }

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to eq('done')
        expect(body['data']['subdomain']).to eq('acme')

        user.reload
        expect(user.password_reset_token).to be_nil
        expect(user.password_reset_expires_at).to be_nil
        expect(user.password_reset_domain).to be_nil
      end
    end

    context 'with no matching token (validation failure)' do
      it 'returns 422 with the user-not-found message' do
        post update_path, params: {
          token:                 'no-such-token',
          password:              'whatever',
          password_confirmation: 'whatever'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to eq('The user could not be found')
      end
    end

    context 'with an expired token (validation failure)' do
      let!(:user) do
        create(
          :user,
          email:                     'expired@example.test',
          auth_id:                   'auth0|expired',
          password_reset_token:      'expired-token',
          password_reset_expires_at: 1.day.ago
        )
      end

      it 'returns 422 with the expired-token message' do
        post update_path, params: {
          token:                 'expired-token',
          password:              'foo',
          password_confirmation: 'foo'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to match(/expired/i)
      end
    end

    context 'with mismatched password and confirmation (validation failure)' do
      it 'returns 422 with the passwords-mismatch message' do
        post update_path, params: {
          token:                 'valid-reset-token',
          password:              'aaa',
          password_confirmation: 'bbb'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to match(/not the same/i)
      end
    end

    context 'when Auth0 rejects the password update' do
      before do
        stub_request(:patch, "#{auth0_base_url}api/v2/users/#{user.auth_id}").to_return(
          status:  400,
          body:    { message: 'password too weak' }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      end

      it 'returns 422 surfacing the Auth0 error' do
        post update_path, params: {
          token:                 'valid-reset-token',
          password:              'short',
          password_confirmation: 'short'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to eq('password too weak')
      end
    end
  end

  describe 'POST /api/v1/verify-password-token (verify)' do
    context 'with a valid, unexpired token' do
      let!(:user) do
        create(
          :user,
          email:                     'verify-me@example.test',
          password_reset_token:      'verify-token',
          password_reset_expires_at: 1.day.from_now
        )
      end

      it 'returns 204 (controller falls through with no render on the success path)' do
        post verify_path, params: { token: 'verify-token' }

        # The controller has no positive-case render -- when the token is
        # valid and unexpired, execution reaches the end of the action and
        # Rails 6 ActionController::API responds 204 No Content. This
        # documents the observable behavior so an upgrade that changes the
        # implicit-render status fails loudly here.
        expect(response).to have_http_status(:no_content)
      end
    end

    context 'with an unknown token (validation failure)' do
      it 'returns 404 with the invalid-token message' do
        post verify_path, params: { token: 'no-such-token' }

        expect(response).to have_http_status(:not_found)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to eq('Invalid token')
      end
    end

    context 'with an expired token (validation failure)' do
      let!(:user) do
        create(
          :user,
          email:                     'verify-expired@example.test',
          password_reset_token:      'verify-expired-token',
          password_reset_expires_at: 1.day.ago
        )
      end

      it 'returns 417 with the expired-token message' do
        post verify_path, params: { token: 'verify-expired-token' }

        expect(response).to have_http_status(:expectation_failed)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to eq('Token expired')
      end
    end
  end

  describe 'POST /api/v1/resend-password-token (resend)' do
    context 'with a matching token' do
      let!(:user) do
        create(
          :user,
          email:                     'resend-me@example.test',
          password_reset_token:      'old-token',
          password_reset_expires_at: 1.day.from_now,
          password_reset_domain:     'acme'
        )
      end

      it 'returns 201, rotates the token, and delivers the mailer' do
        ActionMailer::Base.deliveries.clear

        expect {
          post resend_path, params: { token: 'old-token' }
        }.to change { ActionMailer::Base.deliveries.size }.by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body).to eq('data' => { 'message' => 'done' })

        user.reload
        expect(user.password_reset_token).not_to eq('old-token')
        expect(user.password_reset_token).to be_present

        delivered = ActionMailer::Base.deliveries.last
        expect(delivered.to).to eq([user.email])
        expect(delivered.subject).to eq('Reset your password')
      end
    end

    context 'with a matching email but no token' do
      let!(:user) do
        create(
          :user,
          email:                     'resend-by-email@example.test',
          password_reset_token:      'some-existing-token',
          password_reset_expires_at: 1.day.from_now,
          password_reset_domain:     'acme'
        )
      end

      it 'falls back to email lookup and returns 201' do
        ActionMailer::Base.deliveries.clear

        expect {
          post resend_path, params: { email: user.email }
        }.to change { ActionMailer::Base.deliveries.size }.by(1)

        expect(response).to have_http_status(:created)
      end
    end

    context 'with neither a matching token nor a matching email (validation failure)' do
      it 'returns 404' do
        post resend_path, params: { token: 'no-such-token', email: 'no-such@example.test' }

        expect(response).to have_http_status(:not_found)
        body = JSON.parse(response.body)
        expect(body['data']['message']).to eq('Invalid request')
      end
    end
  end
end
