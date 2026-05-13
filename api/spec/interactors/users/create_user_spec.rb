require 'rails_helper'

RSpec.describe Users::CreateUser do
  let(:user) { build(:user, auth_id: nil) }
  let(:auth_id) { 'auth0|created' }

  subject(:interactor) { described_class.call(user: user, auth_id: auth_id) }

  context 'when the user is new and saves successfully' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'persists the user' do
      expect { interactor }.to change { User.count }.by(1)
    end

    it 'assigns the supplied auth_id to the user' do
      interactor
      expect(user.reload.auth_id).to eq(auth_id)
    end
  end

  context 'when the user is already persisted' do
    let!(:user) { create(:user, auth_id: 'auth0|existing') }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'does not create another user' do
      expect { interactor }.not_to change { User.count }
    end

    it 'does not overwrite the existing auth_id' do
      interactor
      expect(user.reload.auth_id).to eq('auth0|existing')
    end
  end

  context 'when the user fails to save' do
    before do
      allow(user).to receive(:save).and_return(false)
    end

    it 'fails' do
      expect(interactor).to be_a_failure
    end

    it 'sets a descriptive message' do
      expect(interactor.message).to eq('Unable to save user')
    end
  end
end
