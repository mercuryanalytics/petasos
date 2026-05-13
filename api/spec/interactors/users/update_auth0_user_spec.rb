require 'rails_helper'

RSpec.describe Users::UpdateAuth0User do
  let!(:admin_scope) { create(:scope, action: 'admin', scope: 'user') }
  let!(:current_user) do
    u = create(:user)
    u.scopes << admin_scope
    u
  end

  let(:base_url) { Rails.application.credentials[:auth0][:management_api][:base_url] }
  let(:patch_url) { %r{#{Regexp.escape(base_url)}api/v2/users/} }

  subject(:interactor) do
    described_class.call(user: user, params: params, current_user: current_user)
  end

  before do
    allow(Auth0::UserManagementToken).to receive(:call).and_return('stub-token')
  end

  context 'when the email is unchanged and no password is supplied (no-op)' do
    let!(:user) { create(:user, email: 'noop@example.com', auth_id: 'auth0|noop') }
    let(:params) { { contact_name: 'Updated' } }

    it 'is successful without contacting Auth0' do
      expect(interactor).to be_a_success
      expect(WebMock).not_to have_requested(:patch, patch_url)
    end
  end

  context 'when the email changed and the user has an auth_id' do
    let!(:user) { create(:user, email: 'old@example.com', auth_id: 'auth0|patchme') }
    let(:params) { { email: 'new@example.com' } }

    before do
      user.email = 'new@example.com'
      stub_request(:patch, patch_url).to_return(status: 200, body: '{}')
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'patches the Auth0 user record' do
      interactor
      expect(WebMock).to have_requested(:patch, patch_url)
    end
  end

  context 'when Auth0 rejects the patch (primary failure mode)' do
    let!(:user) { create(:user, email: 'old@example.com', auth_id: 'auth0|patchme') }
    let(:params) { { email: 'new@example.com' } }

    before do
      user.email = 'new@example.com'
      stub_request(:patch, patch_url)
        .to_return(status: 400, body: { 'message' => 'invalid email' }.to_json)
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the Auth0 error message' do
      expect(interactor.message).to eq('invalid email')
    end
  end
end
