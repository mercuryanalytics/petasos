require 'rails_helper'

RSpec.describe Clients::RemoveClientOrganizer do
  subject(:interactor) { described_class.call(call_args) }

  describe 'with a persisted client' do
    let!(:client) { create(:client) }
    let(:call_args) { { client: client } }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys the client' do
      expect { interactor }.to change { Client.count }.from(1).to(0)
    end

    context 'when a membership_id is provided and authorizations exist' do
      let!(:user) { create(:user) }
      let!(:membership) { Membership.create!(user: user, client: client) }
      let!(:authorization) do
        Authorization.create!(
          subject_class: 'Client',
          subject_id: client.id,
          membership_id: membership.id,
          client_id: client.id
        )
      end
      let(:call_args) { { client: client, membership_id: membership.id } }

      it 'removes both the authorization and the client' do
        expect { interactor }
          .to change { Authorization.count }.from(1).to(0)
          .and change { Client.count }.from(1).to(0)
      end
    end
  end

  describe 'when the client argument is missing' do
    let(:call_args) { {} }

    it 'raises because RemoveClient cannot operate without a client' do
      expect { interactor }.to raise_error(NoMethodError)
    end
  end
end
