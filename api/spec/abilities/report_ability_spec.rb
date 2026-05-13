# frozen_string_literal: true

require 'rails_helper'
require 'cancan/matchers'

RSpec.describe ReportAbility do
  subject(:ability) { described_class.new(user, project_id) }

  let(:user) { create(:user) }
  let(:client) { create(:client) }
  let(:other_client) { create(:client) }
  let(:project) { create(:project, client: client) }
  let(:other_project) { create(:project, client: client) }
  let(:unrelated_project) { create(:project, client: other_client) }
  let(:report) { create(:report, project: project) }
  let(:sibling_report) { create(:report, project: project) }
  let(:other_project_report) { create(:report, project: other_project) }
  let(:unrelated_report) { create(:report, project: unrelated_project) }
  let(:project_id) { project.id }

  describe 'when the user is a global admin' do
    let!(:admin_scope) { user.scopes << create(:scope, :admin) }

    it 'can manage every report regardless of project' do
      expect(ability).to be_able_to(:manage, report)
      expect(ability).to be_able_to(:manage, unrelated_report)
    end
  end

  describe 'when the user is not an admin' do
    context 'and has no authorizations' do
      it 'cannot view, update, create, or destroy any report' do
        expect(ability).not_to be_able_to(:view, report)
        expect(ability).not_to be_able_to(:update, report)
        expect(ability).not_to be_able_to(:destroy, report)
        expect(ability).not_to be_able_to(:create, Report)
      end
    end

    context 'with a direct Report authorization' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let(:scope_records) { [] }
      let!(:report_authorization) do
        create(:report_auth, subject_id: report.id, client_id: client.id,
                             membership_id: membership.id, scopes: scope_records)
      end

      context 'with the report access scope' do
        let(:scope_records) { [create(:scope, :report, action: 'access')] }

        it 'grants view via the authorized_for_user rule' do
          expect(ability).to be_able_to(:view, report)
          expect(ability).to be_able_to(:read, report)
        end

        it 'does not grant view on a sibling report without its own authorization' do
          expect(ability).not_to be_able_to(:view, sibling_report)
        end
      end

      context 'with the report update scope' do
        let(:scope_records) { [create(:scope, :report, :update)] }

        it 'grants update on the authorized report' do
          expect(ability).to be_able_to(:update, report)
        end

        it 'does not grant update on reports in unrelated clients' do
          expect(ability).not_to be_able_to(:update, unrelated_report)
        end
      end

      context 'with the report destroy scope' do
        let(:scope_records) { [create(:scope, :report, :destroy)] }

        it 'grants destroy on the authorized report' do
          expect(ability).to be_able_to(:destroy, report)
        end

        it 'does not grant destroy on reports in unrelated clients' do
          expect(ability).not_to be_able_to(:destroy, unrelated_report)
        end
      end
    end

    context 'with a client-level authorization granting client access' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:report_eager) { report }
      let!(:other_project_report_eager) { other_project_report }
      let!(:unrelated_report_eager) { unrelated_report }
      let!(:client_authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :client, action: 'access')])
      end

      it 'grants view on reports of every project in that client' do
        expect(ability).to be_able_to(:view, report)
        expect(ability).to be_able_to(:view, other_project_report)
      end

      it 'does not grant view on reports of projects in unrelated clients' do
        expect(ability).not_to be_able_to(:view, unrelated_report)
      end

      it 'does not grant update, create, or destroy on those reports' do
        expect(ability).not_to be_able_to(:update, report)
        expect(ability).not_to be_able_to(:destroy, report)
        expect(ability).not_to be_able_to(:create, Report)
      end
    end

    context 'with a client-level authorization granting client update' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:report_eager) { report }
      let!(:other_project_report_eager) { other_project_report }
      let!(:unrelated_report_eager) { unrelated_report }
      let!(:client_authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :client, :update)])
      end

      it 'grants create and update on reports under projects in the client' do
        expect(ability).to be_able_to(:create, Report.new(project_id: project.id))
        expect(ability).to be_able_to(:update, report)
        expect(ability).to be_able_to(:update, other_project_report)
      end

      it 'does not grant create or update on reports of unrelated client projects' do
        expect(ability).not_to be_able_to(:create, Report.new(project_id: unrelated_project.id))
        expect(ability).not_to be_able_to(:update, unrelated_report)
      end

      it 'does not grant destroy' do
        expect(ability).not_to be_able_to(:destroy, report)
      end
    end

    context 'with a client-level authorization granting client authorize' do
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:report_eager) { report }
      let!(:other_project_report_eager) { other_project_report }
      let!(:unrelated_report_eager) { unrelated_report }
      let!(:client_authorization) do
        create(:client_auth, subject_id: client.id, client_id: client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :client, :authorize)])
      end

      it 'grants manage on reports under projects in the client' do
        expect(ability).to be_able_to(:manage, report)
        expect(ability).to be_able_to(:destroy, report)
      end

      it 'does not grant manage on reports outside the client' do
        expect(ability).not_to be_able_to(:manage, unrelated_report)
      end
    end

    context 'with a project-level authorization and a project_id context' do
      let!(:membership) { create(:membership, user: user, client: client) }

      context 'with the project access scope' do
        let!(:report_eager) { report }
        let!(:sibling_report_eager) { sibling_report }
        let!(:other_project_report_eager) { other_project_report }
        let!(:project_authorization) do
          create(:project_auth, subject_id: project.id, client_id: client.id,
                                membership_id: membership.id,
                                scopes: [create(:scope, :project, action: 'access')])
        end

        it 'grants view on reports in that project' do
          expect(ability).to be_able_to(:view, report)
          expect(ability).to be_able_to(:view, sibling_report)
        end

        it 'does not grant view on reports outside that project' do
          expect(ability).not_to be_able_to(:view, other_project_report)
        end
      end

      context 'with the project update scope' do
        let!(:project_authorization) do
          create(:project_auth, subject_id: project.id, client_id: client.id,
                                membership_id: membership.id,
                                scopes: [create(:scope, :project, :update)])
        end

        it 'grants create and update on reports under that project' do
          expect(ability).to be_able_to(:create, Report.new(project_id: project.id))
          expect(ability).to be_able_to(:update, report)
        end

        it 'does not grant create or update on reports of other projects' do
          expect(ability).not_to be_able_to(:create, Report.new(project_id: other_project.id))
          expect(ability).not_to be_able_to(:update, other_project_report)
        end

        it 'does not grant destroy' do
          expect(ability).not_to be_able_to(:destroy, report)
        end
      end

      context 'with the project authorize scope' do
        let!(:project_authorization) do
          create(:project_auth, subject_id: project.id, client_id: client.id,
                                membership_id: membership.id,
                                scopes: [create(:scope, :project, :authorize)])
        end

        it 'grants manage on reports under that project' do
          expect(ability).to be_able_to(:manage, report)
          expect(ability).to be_able_to(:destroy, report)
        end

        it 'does not grant manage on reports outside that project' do
          expect(ability).not_to be_able_to(:manage, other_project_report)
        end
      end
    end

    context 'when project_id is nil but a direct report authorization exists' do
      let(:project_id) { nil }
      let!(:membership) { create(:membership, user: user, client: client) }
      let!(:report_authorization) do
        create(:report_auth, subject_id: report.id, client_id: client.id,
                             membership_id: membership.id,
                             scopes: [create(:scope, :report, :update)])
      end

      it 'still grants the direct report scope (does not require project_id)' do
        expect(ability).to be_able_to(:update, report)
      end

      it 'does not grant update on unrelated reports' do
        expect(ability).not_to be_able_to(:update, sibling_report)
      end
    end
  end
end
