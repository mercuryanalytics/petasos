require 'rails_helper'

RSpec.describe Users::UpdateLastLogin do
  let!(:user) { create(:user) }

  subject(:interactor) { described_class.call(user: user) }

  context 'when the user saves successfully' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'updates the user last_login timestamp' do
      before_call = Time.current
      interactor
      expect(user.reload.last_login).to be_within(5.seconds).of(before_call)
    end

    it 'exposes the last_login on the context' do
      expect(interactor.last_login).to be_a(Time).or be_a(ActiveSupport::TimeWithZone)
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
      expect(interactor.message).to eq('Could not update last login timestamp')
    end

    it 'exposes the user on the failed context' do
      expect(interactor.user).to eq(user)
    end
  end
end
