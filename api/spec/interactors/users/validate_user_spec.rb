require 'rails_helper'

RSpec.describe Users::ValidateUser do
  let(:email) { 'New.User@example.com' }
  let(:params) { { email: email, contact_name: 'New User' } }

  subject(:interactor) { described_class.call(params: params) }

  context 'with a valid new user' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'downcases the email in params' do
      interactor
      expect(params[:email]).to eq('new.user@example.com')
    end

    it 'exposes a non-persisted user on the context' do
      expect(interactor.user).to be_a(User)
      expect(interactor.user).to be_new_record
    end

    it 'flags the user as new via new_user = 1' do
      expect(interactor.new_user).to eq(1)
    end
  end

  context 'with an existing user' do
    let!(:existing) { create(:user, email: 'new.user@example.com') }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'reuses the existing user record' do
      expect(interactor.user).to eq(existing)
    end

    it 'flags the user as existing via new_user = 0' do
      expect(interactor.new_user).to eq(0)
    end
  end

  context 'when the user fails validation' do
    let(:params) { { email: 'invalid@example.com', contact_name: 'Bad' } }

    before do
      allow_any_instance_of(User).to receive(:valid?).and_return(false)
    end

    it 'fails' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the validation errors as the failure message' do
      expect(interactor.message).to be_a(ActiveModel::Errors)
    end
  end
end
