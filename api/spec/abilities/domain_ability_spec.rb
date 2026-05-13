# frozen_string_literal: true

require 'rails_helper'
require 'cancan/matchers'

RSpec.describe DomainAbility do
  subject(:ability) { described_class.new(user, client_id) }

  let(:user) { create(:user) }
  let(:client) { create(:client) }
  let(:other_client) { create(:client) }
  let(:domain) { create(:domain, client: client) }
  let(:other_domain) { create(:domain, client: other_client) }
  let(:client_id) { client.id }

  describe 'when the user is a global admin' do
    let!(:admin_scope) { user.scopes << create(:scope, :admin) }

    it 'can manage every domain regardless of client' do
      expect(ability).to be_able_to(:manage, domain)
      expect(ability).to be_able_to(:manage, other_domain)
    end
  end

  describe 'when the user is not an admin' do
    context 'and has no current authorization' do
      it 'cannot read or manage any domain' do
        expect(ability).not_to be_able_to(:read, domain)
        expect(ability).not_to be_able_to(:read, other_domain)
        expect(ability).not_to be_able_to(:update, domain)
      end
    end

    context 'with an authorization on the client but no domain scopes' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id,
                             user: user, scopes: [create(:scope, :client, :read)])
      end

      it 'still cannot read domains' do
        expect(ability).not_to be_able_to(:read, domain)
      end
    end

    context 'with an authorization carrying domain scopes' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let(:scope_records) { [] }
      let!(:authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id,
                             scopes: scope_records)
      end

      context 'with a domain read scope' do
        let(:scope_records) { [create(:scope, :domain, :read)] }

        it 'grants read on domains of clients the user is authorized for' do
          expect(ability).to be_able_to(:read, domain)
        end

        it 'does not grant read on domains of unrelated clients' do
          expect(ability).not_to be_able_to(:read, other_domain)
        end
      end

      context 'with a domain update scope' do
        let(:scope_records) { [create(:scope, :domain, :update)] }

        it 'grants update on domains for authorized clients' do
          expect(ability).to be_able_to(:update, domain)
        end

        it 'grants read on domains for authorized clients (default rule when any domain scope is present)' do
          expect(ability).to be_able_to(:read, domain)
        end

        it 'does not grant update on unrelated domains' do
          expect(ability).not_to be_able_to(:update, other_domain)
        end
      end

      context 'with a domain destroy scope' do
        let(:scope_records) { [create(:scope, :domain, :destroy)] }

        it 'grants destroy on domains for authorized clients' do
          expect(ability).to be_able_to(:destroy, domain)
        end

        it 'does not grant destroy on unrelated domains' do
          expect(ability).not_to be_able_to(:destroy, other_domain)
        end
      end

      context 'with a domain create scope' do
        let(:scope_records) { [create(:scope, :domain, :create)] }

        it 'grants create on domains for authorized clients' do
          expect(ability).to be_able_to(:create, domain)
        end
      end
    end

    context 'when client_id does not match any authorization the user has' do
      let(:client_id) { other_client.id }
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id,
                             user: user, scopes: [create(:scope, :domain, :read)])
      end

      it 'cannot read domains because current_authorization is nil for the requested client' do
        expect(ability).not_to be_able_to(:read, domain)
        expect(ability).not_to be_able_to(:read, other_domain)
      end
    end
  end
end
