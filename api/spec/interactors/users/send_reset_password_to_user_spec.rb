require 'rails_helper'

RSpec.describe Users::SendResetPasswordToUser do
  let!(:user) { create(:user, email: 'resetme@example.com') }

  subject(:interactor) do
    described_class.call(
      user:      user,
      no_auth:   no_auth,
      client_id: client_id,
      client:    client,
      new_user:  new_user
    )
  end

  before { ActionMailer::Base.deliveries.clear }

  context 'when neither client_id nor client is present and the user is new' do
    let(:client_id) { nil }
    let(:client) { nil }
    let(:no_auth) { 0 }
    let(:new_user) { 1 }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'sets a password reset token on the user' do
      interactor
      expect(user.reload.password_reset_token).to be_present
    end

    it 'sets the password reset expiration to about one week out' do
      interactor
      expect(user.reload.password_reset_expires_at).to be_within(1.minute).of(1.week.from_now)
    end

    it 'sends the forgot password email' do
      expect { interactor }.to change { ActionMailer::Base.deliveries.size }.by(1)
    end

    it 'sends the email to the user' do
      interactor
      expect(ActionMailer::Base.deliveries.last.to).to include(user.email)
    end
  end

  context 'when a client_id is supplied' do
    let(:client_id) { 42 }
    let(:client) { nil }
    let(:no_auth) { 0 }
    let(:new_user) { 1 }

    it 'is successful (early-returns without sending)' do
      expect(interactor).to be_a_success
    end

    it 'does not send any email' do
      expect { interactor }.not_to change { ActionMailer::Base.deliveries.size }
    end

    it 'does not mutate the user' do
      expect { interactor }.not_to change { user.reload.password_reset_token }
    end
  end

  context 'when the user is existing and no_auth is 1 (primary skip case)' do
    let(:client_id) { nil }
    let(:client) { nil }
    let(:no_auth) { 1 }
    let(:new_user) { 0 }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'does not send any email' do
      expect { interactor }.not_to change { ActionMailer::Base.deliveries.size }
    end
  end
end
