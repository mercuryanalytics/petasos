require 'rails_helper'

RSpec.describe Authorizations::AddAuthorization do
  let!(:client) { create(:client) }
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: client) }

  subject(:interactor) do
    described_class.call(
      user: user,
      client: client,
      client_id: client.id,
      membership_id: membership.id,
      params: { client_id: client.id }
    )
  end

  describe 'success path' do
    it 'succeeds' do
      expect(interactor).to be_a_success
    end

    it 'creates an Authorization for the given subject' do
      expect { interactor }.to change { Authorization.count }.by(1)
    end

    it 'returns the persisted authorization on the context' do
      expect(interactor.authorization).to be_persisted
      expect(interactor.authorization.subject_class).to eq('Client')
      expect(interactor.authorization.subject_id).to eq(client.id)
      expect(interactor.authorization.membership_id).to eq(membership.id)
    end

    it 'marks the user as authorized on the context' do
      interactor
      expect(user.authorized).to eq(true)
    end

    context 'when no_auth is 1' do
      subject(:interactor) do
        described_class.call(
          user: user,
          client: client,
          client_id: client.id,
          membership_id: membership.id,
          no_auth: 1,
          params: { client_id: client.id }
        )
      end

      it 'short-circuits without creating an Authorization' do
        expect { interactor }.to_not change { Authorization.count }
      end

      it 'still reports success' do
        expect(interactor).to be_a_success
      end
    end
  end

  describe 'failure path' do
    context 'when no instance (client, project, report) is supplied' do
      subject(:interactor) do
        described_class.call(
          user: user,
          client_id: client.id,
          membership_id: membership.id,
          params: { client_id: client.id }
        )
      end

      it 'fails the context' do
        expect(interactor).to be_a_failure
      end

      it 'exposes the failure message' do
        expect(interactor.message).to eq('Authorization setup failed, no instance found')
      end

      it 'does not create an Authorization' do
        expect { interactor }.to_not change { Authorization.count }
      end
    end
  end
end
