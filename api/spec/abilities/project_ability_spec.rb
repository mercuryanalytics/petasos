# frozen_string_literal: true

require 'rails_helper'
require 'cancan/matchers'

RSpec.describe ProjectAbility do
  subject(:ability) { described_class.new(user, client_id) }

  let(:user) { create(:user) }
  let(:client) { create(:client) }
  let(:other_client) { create(:client) }
  let(:project) { create(:project, client: client) }
  let(:other_project) { create(:project, client: client) }
  let(:unrelated_project) { create(:project, client: other_client) }
  let(:client_id) { client.id }

  describe 'when the user is a global admin' do
    let!(:admin_scope) { user.scopes << create(:scope, :admin) }

    it 'can manage every project' do
      expect(ability).to be_able_to(:manage, project)
      expect(ability).to be_able_to(:manage, unrelated_project)
    end
  end

  describe 'when the user is not an admin' do
    context 'and has no authorizations' do
      it 'cannot view, update, create, or destroy projects' do
        expect(ability).not_to be_able_to(:view, project)
        expect(ability).not_to be_able_to(:read, project)
        expect(ability).not_to be_able_to(:update, project)
        expect(ability).not_to be_able_to(:destroy, project)
        expect(ability).not_to be_able_to(:create, Project)
      end
    end

    context 'with a direct Project authorization' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let(:scope_records) { [] }
      let!(:project_authorization) do
        create(:project_auth, subject_id: project.id, client_id: client.id,
                              membership_id: membership.id, scopes: scope_records)
      end

      context 'with the project access scope' do
        let(:scope_records) { [create(:scope, :project, action: 'access')] }

        it 'grants view (and aliases read, orphans) on the authorized project' do
          expect(ability).to be_able_to(:view, project)
          expect(ability).to be_able_to(:read, project)
          expect(ability).to be_able_to(:orphans, project)
        end

        it 'does not grant view on unrelated projects' do
          expect(ability).not_to be_able_to(:view, unrelated_project)
        end

        it 'does not grant update or destroy' do
          expect(ability).not_to be_able_to(:update, project)
          expect(ability).not_to be_able_to(:destroy, project)
        end
      end

      context 'with the project update scope' do
        let(:scope_records) { [create(:scope, :project, :update)] }

        it 'grants update on the authorized project only' do
          expect(ability).to be_able_to(:update, project)
          expect(ability).not_to be_able_to(:update, other_project)
        end

        it 'still grants view via the authorized_for_user rule' do
          expect(ability).to be_able_to(:view, project)
        end
      end

      context 'with the project destroy scope' do
        let(:scope_records) { [create(:scope, :project, :destroy)] }

        it 'grants destroy on the authorized project only' do
          expect(ability).to be_able_to(:destroy, project)
          expect(ability).not_to be_able_to(:destroy, other_project)
        end
      end
    end

    context 'with a client-level authorization' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let(:scope_records) { [] }
      let!(:client_authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id, scopes: scope_records)
      end

      context 'with the client access scope' do
        let(:scope_records) { [create(:scope, :client, action: 'access')] }

        it 'grants view on every project in the client' do
          expect(ability).to be_able_to(:view, project)
          expect(ability).to be_able_to(:view, other_project)
        end

        it 'does not grant view on projects of unrelated clients' do
          expect(ability).not_to be_able_to(:view, unrelated_project)
        end

        it 'does not grant create, update, or destroy' do
          expect(ability).not_to be_able_to(:create, Project)
          expect(ability).not_to be_able_to(:update, project)
          expect(ability).not_to be_able_to(:destroy, project)
        end
      end

      context 'with the client update scope' do
        let(:scope_records) { [create(:scope, :client, :update)] }

        it 'grants create and update on projects within the client' do
          expect(ability).to be_able_to(:create, Project.new(domain_id: client.id))
          expect(ability).to be_able_to(:update, project)
          expect(ability).to be_able_to(:update, other_project)
        end

        it 'does not grant create or update on unrelated client projects' do
          expect(ability).not_to be_able_to(:create, Project.new(domain_id: other_client.id))
          expect(ability).not_to be_able_to(:update, unrelated_project)
        end

        it 'does not grant destroy' do
          expect(ability).not_to be_able_to(:destroy, project)
        end
      end

      context 'with the client authorize scope' do
        let(:scope_records) { [create(:scope, :client, :authorize)] }

        it 'grants manage (including destroy) on projects within the client' do
          expect(ability).to be_able_to(:manage, project)
          expect(ability).to be_able_to(:destroy, project)
          expect(ability).to be_able_to(:update, project)
        end

        it 'does not grant manage on projects of unrelated clients' do
          expect(ability).not_to be_able_to(:manage, unrelated_project)
        end
      end
    end

    context 'when the client_authorization is for a different client than client_id' do
      let(:client_id) { client.id }
      let!(:membership) { create(:membership, user: user, client: other_client) }
      let!(:client_authorization) do
        create(:client_auth, subject_id: other_client.id, client_id: other_client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :client, :authorize)])
      end

      it 'does not apply the other-client scope to the queried client_id' do
        expect(ability).not_to be_able_to(:manage, project)
      end
    end
  end
end
