require 'rails_helper'

RSpec.describe Clients::CreateClientOrganizer do
  subject(:interactor) { described_class.call(params: params, user: user) }

  # The Authorizations::AddAuthorization step expects the calling user to already
  # have at least one membership (e.g. an admin creating a new client). Mirror
  # that real-world precondition here.
  let!(:existing_client) { create(:client) }
  let!(:user) { create(:user, clients: [existing_client]) }

  describe 'with valid params' do
    let(:params) { { name: 'Acme Co' } }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'creates a client' do
      expect { interactor }.to change { Client.count }.by(1)
      expect(interactor.client.name).to eq('Acme Co')
      expect(interactor.client).to be_persisted
    end

    it 'creates an authorization on the new client' do
      expect { interactor }.to change { Authorization.count }.by(1)
      authorization = Authorization.last
      expect(authorization.subject_class).to eq('Client')
      expect(authorization.subject_id).to eq(interactor.client.id)
    end
  end

  describe 'with invalid params (missing name)' do
    let(:params) { { name: '' } }

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not create a client' do
      expect { interactor }.not_to change { Client.count }
    end

    it 'exposes the validation errors as the message' do
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
