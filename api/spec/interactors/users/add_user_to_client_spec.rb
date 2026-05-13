require 'rails_helper'

RSpec.describe Users::AddUserToClient do
  let!(:user) { create(:user) }
  let!(:client) { create(:client) }
  let(:authorization_params) { { client_id: client.id } }

  subject(:interactor) do
    described_class.call(
      user:                 user,
      params:               {},
      authorization_params: authorization_params
    )
  end

  context 'when the client exists and the user is not yet a member' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'attaches the client to the user' do
      expect { interactor }.to change { user.reload.clients.count }.from(0).to(1)
      expect(user.clients).to include(client)
    end
  end

  context 'when the user is already a member of the client' do
    before do
      create(:membership, user_id: user.id, client_id: client.id)
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'does not create a duplicate membership' do
      expect { interactor }.not_to change { user.reload.memberships.count }
    end
  end

  context 'when authorization_params has no client_id' do
    let(:authorization_params) { {} }

    it 'is successful (no-op)' do
      expect(interactor).to be_a_success
    end

    it 'does not change client memberships' do
      expect { interactor }.not_to change { Membership.count }
    end
  end

  context 'when the client cannot be found' do
    let(:authorization_params) { { client_id: -1 } }

    it 'raises ActiveRecord::RecordNotFound (primary failure mode)' do
      expect { interactor }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
