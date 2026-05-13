require 'rails_helper'

RSpec.describe Clients::RemoveClient do
  subject(:interactor) { described_class.call(client: client) }

  describe 'with a persisted client' do
    let!(:client) { create(:client) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys the client' do
      expect { interactor }.to change { Client.count }.from(1).to(0)
    end
  end

  describe 'with a client that cannot be destroyed' do
    let!(:client) { create(:client) }

    before do
      allow(client).to receive(:destroy).and_return(false)
    end

    it 'still completes without raising' do
      expect { interactor }.not_to raise_error
    end

    it 'leaves the client in place' do
      interactor
      expect(Client.exists?(client.id)).to be(true)
    end
  end
end
