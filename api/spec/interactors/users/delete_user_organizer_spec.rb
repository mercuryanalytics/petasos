require 'rails_helper'

RSpec.describe Users::DeleteUserOrganizer do
  let!(:user) { create(:user, auth_id: 'auth0|deleteme') }
  let!(:client) { create(:client) }
  let!(:membership) { create(:membership, user_id: user.id, client_id: client.id) }

  subject(:interactor) do
    described_class.call(user: user, client_id: client.id, remove_user_from_system: false)
  end

  before do
    # Skip the actual Auth0 HTTP call inside DeleteAuth0User.
    allow(Users::DeleteAuth0User).to receive(:call!) { |c| c }
  end

  context 'when the user has a single membership' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys the membership' do
      expect { interactor }.to change { Membership.count }.by(-1)
    end

    it 'destroys the user (flagged for full removal)' do
      expect { interactor }.to change { User.count }.by(-1)
    end
  end

  context 'when the user has multiple memberships' do
    let!(:other_client) { create(:client) }
    let!(:other_membership) { create(:membership, user_id: user.id, client_id: other_client.id) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'removes only the targeted membership' do
      expect { interactor }.to change { Membership.where(user_id: user.id).count }.by(-1)
    end

    it 'keeps the user record' do
      expect { interactor }.not_to change { User.count }
    end
  end

  context 'when DeleteAuth0User fails (primary failure mode)' do
    before do
      allow(Users::DeleteAuth0User).to receive(:call!) do |context|
        context.fail!(message: 'Auth0 boom')
      end
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the failure message' do
      expect(interactor.message).to eq('Auth0 boom')
    end
  end
end
