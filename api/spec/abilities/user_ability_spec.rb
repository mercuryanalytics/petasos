# frozen_string_literal: true

require 'rails_helper'
require 'cancan/matchers'

RSpec.describe UserAbility do
  subject(:ability) { described_class.new(user, client_id) }

  let(:user) { create(:user) }
  let(:client) { create(:client) }
  let(:other_client) { create(:client) }
  let(:client_id) { nil }

  describe 'when the user is a global admin' do
    let!(:admin_scope) { user.scopes << create(:scope, :admin) }

    it 'can manage every user' do
      target = create(:user)
      expect(ability).to be_able_to(:manage, target)
    end

    it 'can manage everything' do
      expect(ability).to be_able_to(:manage, :all)
    end
  end

  describe 'when the user is not an admin' do
    context 'and has no memberships' do
      it 'can read, update, and authorized themselves' do
        expect(ability).to be_able_to(:read, user)
        expect(ability).to be_able_to(:update, user)
        expect(ability).to be_able_to(:authorized, user)
      end

      it 'cannot destroy themselves' do
        expect(ability).not_to be_able_to(:destroy, user)
      end

      it 'cannot read or manage another user' do
        target = create(:user)
        expect(ability).not_to be_able_to(:read, target)
        expect(ability).not_to be_able_to(:manage, target)
      end
    end

    context 'with a membership and a client authorization having an access scope' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:client_authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :client, action: 'access')])
      end

      let!(:peer_user) { create(:user) }
      let!(:peer_membership) { create(:membership, user: peer_user, client: client) }
      let!(:outsider) { create(:user) }
      let!(:outsider_membership) { create(:membership, user: outsider, client: other_client) }

      it 'can manage users sharing a client membership' do
        expect(ability).to be_able_to(:manage, peer_user)
      end

      it 'cannot manage users in clients they do not share' do
        expect(ability).not_to be_able_to(:manage, outsider)
      end
    end

    context 'with a membership and a client authorization having an authorize scope' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:client_authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :client, :authorize)])
      end

      let!(:peer_user) { create(:user) }
      let!(:peer_membership) { create(:membership, user: peer_user, client: client) }

      it 'can manage other users in the same client' do
        expect(ability).to be_able_to(:manage, peer_user)
      end
    end

    context 'with a client_id context and current_authorization carrying user scopes' do
      let(:client_id) { client.id }
      let!(:membership) { create(:membership, user: user, client: client) }
      let(:scope_records) { [] }
      let!(:current_authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id, scopes: scope_records)
      end
      let!(:peer_user) { create(:user) }
      let!(:peer_membership) { create(:membership, user: peer_user, client: client) }
      let!(:outsider) { create(:user) }
      let!(:outsider_membership) { create(:membership, user: outsider, client: other_client) }

      context 'with no user scopes' do
        let(:scope_records) { [create(:scope, :client, :read)] }

        it 'grants read on users in the same client (base rule)' do
          expect(ability).to be_able_to(:read, peer_user)
        end

        it 'does not grant read on users in other clients' do
          expect(ability).not_to be_able_to(:read, outsider)
        end

        it 'does not grant update on peer users without a user update scope' do
          expect(ability).not_to be_able_to(:update, peer_user)
        end
      end

      context 'with a user update scope' do
        let(:scope_records) { [create(:scope, :user, :update)] }

        it 'grants update on users sharing the client' do
          expect(ability).to be_able_to(:update, peer_user)
        end

        it 'does not grant update on users outside that client' do
          expect(ability).not_to be_able_to(:update, outsider)
        end
      end

      context 'with a user destroy scope' do
        let(:scope_records) { [create(:scope, :user, :destroy)] }

        it 'grants destroy on users sharing the client' do
          expect(ability).to be_able_to(:destroy, peer_user)
        end

        it 'does not grant destroy on users outside that client' do
          expect(ability).not_to be_able_to(:destroy, outsider)
        end
      end

      context 'with a user create scope' do
        let(:scope_records) { [create(:scope, :user, :create)] }

        it 'grants create on users sharing the client' do
          new_user = build(:user)
          new_user.memberships.build(client: client)
          expect(ability).to be_able_to(:create, new_user)
        end
      end
    end

    context 'with a client_id context but no current_authorization for that client' do
      let(:client_id) { other_client.id }
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :user, :update)])
      end
      let!(:other_user) { create(:user) }
      let!(:other_user_membership) { create(:membership, user: other_user, client: other_client) }

      it 'does not grant the user scopes for the requested client' do
        expect(ability).not_to be_able_to(:update, other_user)
      end
    end
  end
end
