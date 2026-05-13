require 'rails_helper'

RSpec.describe Clients::CreateClient do
  subject(:interactor) { described_class.call(client: client) }

  describe 'with a valid client' do
    let(:client) { Client.new(name: 'Acme Co') }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'persists the client' do
      expect { interactor }.to change { Client.count }.by(1)
    end

    it 'exposes the saved client on the context' do
      expect(interactor.client).to be_persisted
    end
  end

  describe 'with an invalid client (missing name)' do
    let(:client) { Client.new(name: nil) }

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not persist the client' do
      expect { interactor }.not_to change { Client.count }
    end

    it 'exposes the validation errors as the message' do
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
