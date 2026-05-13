require 'rails_helper'

RSpec.describe Users::TriggerResetPassword do
  let(:base_url) { Rails.application.credentials[:auth0][:management_api][:base_url] }
  let(:reset_endpoint) { "#{base_url}dbconnections/change_password" }

  subject(:interactor) { described_class.call(user: user) }

  before do
    allow(Auth0::UserManagementToken).to receive(:call).and_return('stub-token')
  end

  context 'when the user has an auth0-issued auth_id' do
    let!(:user) { create(:user, auth_id: 'auth0|abc123') }

    before do
      stub_request(:post, reset_endpoint).to_return(status: 200, body: 'OK')
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'posts to the Auth0 change_password endpoint' do
      interactor
      expect(WebMock).to have_requested(:post, reset_endpoint)
    end
  end

  context 'when the user has a non-auth0 auth_id (primary skip case)' do
    let!(:user) { create(:user, auth_id: 'google|xyz') }

    it 'is successful without hitting Auth0' do
      expect(interactor).to be_a_success
      expect(WebMock).not_to have_requested(:post, reset_endpoint)
    end
  end
end
