require 'rails_helper'

RSpec.describe Users::UpdateUserMetadataWithLogoUrl do
  let!(:user) { create(:user, auth_id: 'auth0|metadata-user') }
  let(:base_url) { Rails.application.credentials[:auth0][:management_api][:base_url] }
  let(:patch_url) { %r{#{Regexp.escape(base_url)}api/v2/users/} }

  subject(:interactor) do
    described_class.call(
      user:      user,
      no_auth:   no_auth,
      client_id: client_id,
      client:    client,
      new_user:  new_user
    )
  end

  before do
    allow(Auth0::UserManagementToken).to receive(:call).and_return('stub-token')
  end

  context 'when there is no client and the user is new' do
    let(:client_id) { nil }
    let(:client) { nil }
    let(:no_auth) { 0 }
    let(:new_user) { 1 }

    before do
      stub_request(:patch, patch_url).to_return(status: 200, body: '{}')
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'patches the Auth0 user metadata' do
      interactor
      expect(WebMock).to have_requested(:patch, patch_url)
    end
  end

  context 'when a client_id is supplied (primary skip case)' do
    let(:client_id) { 99 }
    let(:client) { nil }
    let(:no_auth) { 0 }
    let(:new_user) { 1 }

    it 'is successful without contacting Auth0' do
      expect(interactor).to be_a_success
      expect(WebMock).not_to have_requested(:patch, patch_url)
    end
  end

  context 'when Auth0 rejects the metadata patch (primary failure mode)' do
    let(:client_id) { nil }
    let(:client) { nil }
    let(:no_auth) { 0 }
    let(:new_user) { 1 }

    before do
      stub_request(:patch, patch_url)
        .to_return(status: 400, body: { 'message' => 'bad metadata' }.to_json)
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the Auth0 message' do
      expect(interactor.message).to eq('bad metadata')
    end
  end
end
