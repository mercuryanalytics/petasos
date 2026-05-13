require 'rails_helper'

RSpec.describe Users::CreateAuth0User do
  let(:email) { 'newauth@example.com' }
  let(:params) { { email: email } }
  let(:user) { build(:user, email: email, auth_id: nil) }
  let(:base_url) { Rails.application.credentials[:auth0][:management_api][:base_url] }
  let(:users_endpoint) { "#{base_url}api/v2/users" }
  let(:users_by_email_url) { %r{#{Regexp.escape(base_url)}api/v2/users-by-email} }

  subject(:interactor) { described_class.call(params: params, user: user) }

  before do
    allow(Auth0::UserManagementToken).to receive(:call).and_return('stub-token')
  end

  context 'when Auth0 successfully creates the user' do
    before do
      stub_request(:post, users_endpoint)
        .to_return(status: 201, body: { 'user_id' => 'auth0|created' }.to_json)
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'exposes the new auth_id on the context' do
      expect(interactor.auth_id).to eq('auth0|created')
    end
  end

  context 'when the user is already persisted (no-op)' do
    let!(:user) { create(:user, auth_id: 'auth0|already-there') }

    it 'is successful without hitting Auth0' do
      expect(interactor).to be_a_success
      expect(WebMock).not_to have_requested(:post, users_endpoint)
    end
  end

  context 'when Auth0 rejects the create but the user can be found by email' do
    before do
      stub_request(:post, users_endpoint)
        .to_return(status: 409, body: { 'message' => 'already exists' }.to_json)
      stub_request(:get, users_by_email_url)
        .to_return(status: 200, body: [{ 'user_id' => 'auth0|found-by-email' }].to_json)
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'exposes the auth_id from the fallback lookup' do
      expect(interactor.auth_id).to eq('auth0|found-by-email')
    end
  end

  context 'when Auth0 rejects the create and no user exists (primary failure mode)' do
    before do
      stub_request(:post, users_endpoint)
        .to_return(status: 409, body: { 'message' => 'already exists' }.to_json)
      stub_request(:get, users_by_email_url)
        .to_return(status: 200, body: [].to_json)
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end
  end
end
