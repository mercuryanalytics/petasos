require 'rails_helper'

RSpec.describe Users::DeleteUser do
  let!(:user) { create(:user) }

  subject(:interactor) { described_class.call(user: user, remove_user_from_system: remove_user_from_system) }

  context 'when remove_user_from_system is true' do
    let(:remove_user_from_system) { true }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys the user' do
      expect { interactor }.to change { User.count }.by(-1)
    end
  end

  context 'when remove_user_from_system is false' do
    let(:remove_user_from_system) { false }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'does not destroy the user' do
      expect { interactor }.not_to change { User.count }
    end
  end
end
