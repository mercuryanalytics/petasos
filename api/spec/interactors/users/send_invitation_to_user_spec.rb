require 'rails_helper'

RSpec.describe Users::SendInvitationToUser do
  let!(:user) { create(:user, email: 'invitee@example.com') }
  let!(:client) { create(:client, name: 'Acme Co') }
  let!(:inviter) { create(:user) }

  subject(:interactor) do
    described_class.call(
      user:                 user,
      authorization_params: {},
      current_user:         inviter,
      client_id:            client.id,
      no_auth:              1,
      new_user:             1
    )
  end

  before { ActionMailer::Base.deliveries.clear }

  context 'with a client and a new user' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'sets a password reset token on the user' do
      interactor
      expect(user.reload.password_reset_token).to be_present
    end

    it 'sets the password reset expiration to roughly one week from now' do
      interactor
      expect(user.reload.password_reset_expires_at).to be_within(1.minute).of(1.week.from_now)
    end

    it 'sends the invitation email' do
      expect { interactor }.to change { ActionMailer::Base.deliveries.size }.by(1)
    end

    it 'sends the email to the invited user' do
      interactor
      expect(ActionMailer::Base.deliveries.last.to).to include(user.email)
    end
  end

  context 'when no client_id or client is provided' do
    subject(:interactor) do
      described_class.call(
        user:                 user,
        authorization_params: {},
        current_user:         inviter,
        client_id:            nil,
        no_auth:              1,
        new_user:             1
      )
    end

    it 'is successful (no-op)' do
      expect(interactor).to be_a_success
    end

    it 'does not send any email' do
      expect { interactor }.not_to change { ActionMailer::Base.deliveries.size }
    end
  end

  context 'when the user is existing and no_auth is 0 (primary skip case)' do
    subject(:interactor) do
      described_class.call(
        user:                 user,
        authorization_params: {},
        current_user:         inviter,
        client_id:            client.id,
        no_auth:              0,
        new_user:             0
      )
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'does not send any email' do
      expect { interactor }.not_to change { ActionMailer::Base.deliveries.size }
    end
  end
end
