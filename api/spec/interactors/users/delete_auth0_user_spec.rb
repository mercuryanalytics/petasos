require 'rails_helper'

RSpec.describe Users::DeleteAuth0User do
  let!(:user) { create(:user, auth_id: 'auth0|deleteme') }
  let(:base_url) { Rails.application.credentials[:auth0][:management_api][:base_url] }
  let(:delete_url) { %r{#{Regexp.escape(base_url)}api/v2/users/} }

  subject(:interactor) do
    described_class.call(user: user, remove_user_from_system: remove_user_from_system)
  end

  before do
    allow(Auth0::UserManagementToken).to receive(:call).and_return('stub-token')
  end

  context 'when Auth0 confirms the delete' do
    let(:remove_user_from_system) { true }

    before do
      stub_request(:delete, delete_url).to_return(status: 204, body: '')
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'calls the Auth0 delete endpoint with the user auth_id' do
      interactor
      expect(WebMock).to have_requested(:delete, %r{api/v2/users/auth0%7Cdeleteme})
    end
  end

  context 'when remove_user_from_system is false (no-op)' do
    let(:remove_user_from_system) { false }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'does not call Auth0' do
      interactor
      expect(WebMock).not_to have_requested(:delete, delete_url)
    end
  end

  context 'when the user has no auth_id' do
    let!(:user) { create(:user, auth_id: nil) }
    let(:remove_user_from_system) { true }

    it 'is successful without hitting Auth0' do
      expect(interactor).to be_a_success
      expect(WebMock).not_to have_requested(:delete, delete_url)
    end
  end

  context 'when Auth0 rejects the delete (primary failure mode)' do
    let(:remove_user_from_system) { true }

    before do
      stub_request(:delete, delete_url)
        .to_return(status: 400, body: { 'message' => 'cannot delete' }.to_json)
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the Auth0 message' do
      expect(interactor.message).to eq('cannot delete')
    end
  end
end
