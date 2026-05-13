require 'rails_helper'

RSpec.describe Users::UpdateUser do
  let(:user) { create(:user) }

  subject(:interactor) { described_class.call(user: user) }

  context 'when the user saves successfully' do
    before do
      user.contact_name = 'Updated Name'
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'persists the changes' do
      interactor
      expect(user.reload.contact_name).to eq('Updated Name')
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
      expect(interactor.message).to eq('Could not update the user')
    end
  end
end
