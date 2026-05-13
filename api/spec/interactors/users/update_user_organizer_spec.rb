require 'rails_helper'

RSpec.describe Users::UpdateUserOrganizer do
  let!(:user) { create(:user, email: 'current@example.com', auth_id: 'auth0|existing') }
  let(:params) { { email: 'current@example.com', contact_name: 'New Name' } }

  subject(:interactor) do
    described_class.call(params: params, user: user)
  end

  before do
    # Sidestep the Auth0-touching sub-interactor; covered in its own spec.
    allow(Users::UpdateAuth0User).to receive(:call!) { |c| c }
  end

  context 'when the params yield a valid user' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'persists the updated attributes' do
      interactor
      expect(user.reload.contact_name).to eq('New Name')
    end
  end

  context 'when validation fails (primary failure mode)' do
    before do
      allow_any_instance_of(User).to receive(:valid?).and_return(false)
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not change the user attributes' do
      expect { interactor }.not_to change { user.reload.contact_name }
    end
  end
end
