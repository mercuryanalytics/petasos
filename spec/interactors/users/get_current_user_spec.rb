require 'rails_helper'

RSpec.describe Users::GetCurrentUser do
  let(:email) { Faker::Internet.email }
  let(:auth_id) { 'auth0|test' }
  let!(:user) { create(:user, auth_id: auth_id, email: email) }
  let(:params) { { auth_id: auth_id, email: 'test@test.com' } }

  subject { described_class.call(**params) }

  it 'fetches the user by auth_id' do
    expect(subject.user).to eq(user)
  end

  it 'returns success' do
    expect(subject.success?).to eq(true)
  end

  context 'when auth_id is not in the database' do
    let(:auth_id) { nil }
    let(:params) { { auth_id: 'auth0|aasada', email: email } }

    it 'returns success' do
      expect(subject.success?).to eq(true)
    end

    it 'fetches the user by email' do
      expect(subject.user).to eq(user)
    end

    it 'sets the user auth_id' do
      expect(subject.user.auth_id).to eq('auth0|aasada')
    end
  end

  context 'when the user is not present in the database' do
    let(:params) { { auth_id: 'auth0|aaa', email: 'test@test.com' } }

    it 'initializes the user record' do
      expect(subject.user.new_record?).to eq(true)
    end

    it 'sets the email to the given param' do
      expect(subject.user.email).to eq('test@test.com')
    end

    it 'sets the auth_id' do
      expect(subject.user.auth_id).to eq('auth0|aaa')
    end

    context 'when the domain is not in the database' do
      it 'runs unsuccessful' do
        expect(subject.success?).to eq(false)
      end

      it 'returns the message' do
        expect(subject.message).to eq('No domain found for the given user domain')
      end
    end

    context 'when the domain is present' do
      let(:domain) { build(:domain, name: 'mercury.com') }
      let!(:client) { create(:client, domains: [domain]) }
      let(:params) { { auth_id: 'auth0|aaa', email: "test@#{domain.name}" } }

      before do
        allow(Authorizations::AddClientDefaultAuthorizations).to receive(:call)
      end

      it 'runs successful' do
        expect(subject.success?).to eq(true)
      end

      it('saves the user') do
        expect(subject.user.new_record?).to_not eq(true)
      end

      it 'adds the user to the client' do
        expect(subject.user.memberships.map(&:client_id)).to include(client.id)
      end

      it 'calls the AddDefaultClientAuthorization with the given params' do
        expect(Authorizations::AddClientDefaultAuthorizations).to receive(:call).with(
          user:    an_instance_of(User), # since the user is created during subject save, we don't have it yet
          client:  client,
          no_auth: 1
        )

        subject
      end
    end
  end
end
