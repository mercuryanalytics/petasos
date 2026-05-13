require 'rails_helper'

RSpec.describe Users::CheckUserMembership do
  let!(:user) { create(:user) }
  let!(:client) { create(:client) }

  subject(:interactor) do
    described_class.call(
      user:                    user,
      client_id:               client.id,
      remove_user_from_system: remove_user_from_system
    )
  end

  context 'when remove_user_from_system was already truthy' do
    let(:remove_user_from_system) { true }
    let!(:membership) { create(:membership, user_id: user.id, client_id: client.id) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'does not delete the membership' do
      expect { interactor }.not_to change { Membership.count }
    end

    it 'keeps remove_user_from_system as true' do
      expect(interactor.remove_user_from_system).to eq(true)
    end
  end

  context 'when the user has a single membership' do
    let(:remove_user_from_system) { false }
    let!(:membership) { create(:membership, user_id: user.id, client_id: client.id) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys the membership' do
      expect { interactor }.to change { Membership.count }.by(-1)
    end

    it 'flags the user for removal from the system' do
      expect(interactor.remove_user_from_system).to eq(true)
    end
  end

  context 'when the user has multiple memberships' do
    let(:remove_user_from_system) { false }
    let!(:membership_one) { create(:membership, user_id: user.id, client_id: client.id) }
    let!(:other_client) { create(:client) }
    let!(:membership_two) { create(:membership, user_id: user.id, client_id: other_client.id) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys only the matching membership' do
      expect { interactor }.to change { Membership.count }.by(-1)
      expect(Membership.where(user_id: user.id).pluck(:client_id)).to eq([other_client.id])
    end

    it 'does not flag the user for removal from the system' do
      expect(interactor.remove_user_from_system).to eq(false)
    end
  end
end
