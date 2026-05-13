require 'rails_helper'

RSpec.describe Clients::UpdateClientOrganizer do
  subject(:interactor) { described_class.call(params: params, client: client) }

  let!(:client) { create(:client, name: 'Original') }

  describe 'with valid params' do
    let(:params) { { name: 'Renamed' } }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'updates the client name' do
      expect { interactor }.to change { client.reload.name }.from('Original').to('Renamed')
    end

    it 'exposes the updated client on the context' do
      expect(interactor.client).to eq(client)
      expect(interactor.client.name).to eq('Renamed')
    end
  end

  describe 'with invalid params (blank name)' do
    let(:params) { { name: '' } }

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not update the client name' do
      expect { interactor }.not_to change { client.reload.name }
    end

    it 'exposes the validation errors as the message' do
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
