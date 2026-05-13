require 'rails_helper'

RSpec.describe Users::GetAuth0User do
  let(:email) { 'lookup@example.com' }
  let(:base_url) { Rails.application.credentials[:auth0][:management_api][:base_url] }
  let(:users_by_email_url) { %r{#{Regexp.escape(base_url)}api/v2/users-by-email} }

  subject(:interactor) { described_class.call(email: email) }

  before do
    allow(Auth0::UserManagementToken).to receive(:call).and_return('stub-token')
  end

  context 'when Auth0 returns a matching user' do
    before do
      stub_request(:get, users_by_email_url)
        .to_return(status: 200, body: [{ 'user_id' => 'auth0|abc123' }].to_json)
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'exposes the auth_id on the context' do
      expect(interactor.auth_id).to eq('auth0|abc123')
    end
  end

  context 'when Auth0 returns an empty result (primary failure mode)' do
    before do
      stub_request(:get, users_by_email_url)
        .to_return(status: 200, body: [].to_json)
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'sets the message to "not_exists"' do
      expect(interactor.message).to eq('not_exists')
    end
  end
end
