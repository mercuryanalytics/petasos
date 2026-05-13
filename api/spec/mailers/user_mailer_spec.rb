require 'rails_helper'

RSpec.describe UserMailer, type: :mailer do
  describe '#forgot_password_email' do
    let(:user) do
      create(
        :user,
        email: 'recipient@example.com',
        password_reset_token: 'abc123token',
        password_reset_domain: nil
      )
    end
    let(:client) { create(:client, name: 'Acme Co') }

    subject(:mail) { described_class.forgot_password_email(user, client) }

    it 'is delivered to the user email address' do
      expect(mail.to).to eq(['recipient@example.com'])
    end

    it 'has the configured subject line' do
      expect(mail.subject).to eq('Reset your password')
    end

    it 'greets the user and prompts a password change in the body' do
      body = mail.body.encoded
      expect(body).to include('recipient@example.com')
      expect(body).to include('You have requested a password change.')
    end

    it 'includes a password-reset link carrying the user token' do
      expect(mail.body.encoded).to include('password-reset?token=abc123token')
    end
  end

  describe '#invitation_email' do
    let(:user) do
      create(
        :user,
        email: 'invitee@example.com',
        password_reset_token: 'xyz789token',
        auth_id: 'auth0|invited-user-id'
      )
    end
    let(:client) { create(:client, name: 'Acme Co') }
    let(:inviter) do
      create(
        :user,
        email: 'inviter@example.com',
        contact_name: 'Pat Inviter'
      )
    end

    subject(:mail) { described_class.invitation_email(user, client, inviter) }

    it 'is delivered to the invited user email address' do
      expect(mail.to).to eq(['invitee@example.com'])
    end

    it 'has a subject referencing the inviting client name' do
      expect(mail.subject).to eq('You have been invited to join Acme Co')
    end

    it 'names the client in the body' do
      expect(mail.body.encoded).to include('Acme Co')
    end

    it 'identifies the inviter in the body' do
      expect(mail.body.encoded).to include('Pat Inviter')
    end

    context 'when the inviter has no contact_name' do
      let(:inviter) do
        create(
          :user,
          email: 'no-name-inviter@example.com',
          contact_name: nil
        )
      end

      it 'falls back to the inviter email address in the body' do
        expect(mail.body.encoded).to include('no-name-inviter@example.com')
      end
    end
  end
end
