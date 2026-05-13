require 'rails_helper'

RSpec.describe Clients::ValidateClient do
  subject(:interactor) { described_class.call(params: params, client: existing_client) }

  let(:existing_client) { nil }

  describe 'with valid params' do
    let(:params) { { name: 'Acme Co' } }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'exposes a built client on the context' do
      expect(interactor.client).to be_a(Client)
      expect(interactor.client.name).to eq('Acme Co')
    end

    it 'does not persist the client' do
      expect { interactor }.not_to change { Client.count }
    end
  end

  describe 'with invalid params (missing name)' do
    let(:params) { { name: '' } }

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the validation errors as the message' do
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
