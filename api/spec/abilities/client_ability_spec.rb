# frozen_string_literal: true

require 'rails_helper'
require 'cancan/matchers'

RSpec.describe ClientAbility do
  subject(:ability) { described_class.new(user, client_id) }

  let(:user) { create(:user) }
  let(:client) { create(:client) }
  let(:other_client) { create(:client) }
  let(:client_id) { nil }

  describe 'when the user is a global admin' do
    let!(:admin_scope) { user.scopes << create(:scope, :admin) }

    it 'can manage every client' do
      expect(ability).to be_able_to(:manage, client)
      expect(ability).to be_able_to(:manage, other_client)
    end

    it 'can manage arbitrary subjects' do
      expect(ability).to be_able_to(:manage, :all)
    end
  end

  describe 'when the user is not an admin' do
    context 'and has no memberships' do
      it 'cannot view any client' do
        expect(ability).not_to be_able_to(:view, client)
        expect(ability).not_to be_able_to(:read, client)
      end

      it 'cannot create clients' do
        expect(ability).not_to be_able_to(:create, Client)
      end
    end

    context 'and has a membership with an authorization on the client' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id)
      end

      it 'can view the client they are authorized for' do
        expect(ability).to be_able_to(:view, client)
        expect(ability).to be_able_to(:read, client)
        expect(ability).to be_able_to(:orphans, client)
      end

      it 'cannot view an unrelated client' do
        expect(ability).not_to be_able_to(:view, other_client)
      end

      it 'cannot create clients without a client_id context and scope' do
        expect(ability).not_to be_able_to(:create, Client)
      end

      it 'cannot update or destroy the client without a scope' do
        expect(ability).not_to be_able_to(:update, client)
        expect(ability).not_to be_able_to(:destroy, client)
      end
    end

    context 'with a client_id context and an authorization carrying client scopes' do
      let(:client_id) { client.id }
      let!(:membership) { create(:membership, user: user, client: client) }
      let(:scope_records) { [] }
      let!(:authorization) do
        create(
          :client_auth,
          subject_id: client.id,
          client_id: client.id,
          membership_id: membership.id,
          scopes: scope_records
        )
      end

      context 'with a client update scope' do
        let(:scope_records) { [create(:scope, :client, :update)] }

        it 'grants update on clients they are authorized for' do
          expect(ability).to be_able_to(:update, client)
        end

        it 'does not grant update on unrelated clients' do
          expect(ability).not_to be_able_to(:update, other_client)
        end

        it 'does not grant create' do
          expect(ability).not_to be_able_to(:create, Client)
        end
      end

      context 'with a client destroy scope' do
        let(:scope_records) { [create(:scope, :client, :destroy)] }

        it 'grants destroy on the authorized client' do
          expect(ability).to be_able_to(:destroy, client)
        end

        it 'does not grant destroy on unrelated clients' do
          expect(ability).not_to be_able_to(:destroy, other_client)
        end
      end

      context 'with a client authorize scope' do
        let(:scope_records) { [create(:scope, :client, :authorize)] }

        it 'grants create on Client' do
          expect(ability).to be_able_to(:create, Client)
        end

        it 'grants authorize on the authorized client' do
          expect(ability).to be_able_to(:authorize, client)
        end

        it 'does not grant authorize on unrelated clients' do
          expect(ability).not_to be_able_to(:authorize, other_client)
        end
      end

      context 'with a client read scope' do
        let(:scope_records) { [create(:scope, :client, :read)] }

        it 'still grants view via the base authorized_for_user rule' do
          expect(ability).to be_able_to(:view, client)
          expect(ability).to be_able_to(:read, client)
        end

        it 'does not grant update or destroy' do
          expect(ability).not_to be_able_to(:update, client)
          expect(ability).not_to be_able_to(:destroy, client)
        end
      end
    end

    context 'with a client_id pointing at a client the user does not belong to' do
      let(:client_id) { other_client.id }
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id,
                             scopes: [create(:scope, :client, :update)])
      end

      it 'does not grant scope-specific actions on the unrelated client' do
        expect(ability).not_to be_able_to(:update, other_client)
        expect(ability).not_to be_able_to(:create, Client)
      end
    end
  end
end
