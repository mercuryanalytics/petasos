require 'rails_helper'

RSpec.describe Clients::UpdateClient do
  subject(:interactor) { described_class.call(client: client) }

  describe 'with a valid client' do
    let!(:persisted_client) { create(:client, name: 'Original') }
    let(:client) do
      Client.find(persisted_client.id).tap { |c| c.name = 'Renamed' }
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'persists the change' do
      interactor
      expect(persisted_client.reload.name).to eq('Renamed')
    end
  end

  describe 'with an invalid client (blank name)' do
    let!(:persisted_client) { create(:client, name: 'Original') }
    let(:client) do
      Client.find(persisted_client.id).tap { |c| c.name = '' }
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not persist the change' do
      interactor
      expect(persisted_client.reload.name).to eq('Original')
    end

    it 'exposes the validation errors as the message' do
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
