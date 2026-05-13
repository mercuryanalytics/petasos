require 'rails_helper'

RSpec.describe Authorizations::AddAuthorizationFromParent do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:report) { create(:report, project: project) }
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: client) }

  describe 'success path' do
    context 'when adding a project and the client has authorizations' do
      let!(:client_authorization) do
        create(
          :authorization,
          subject_class: 'Client',
          subject_id: client.id,
          membership_id: membership.id
        )
      end

      subject(:interactor) { described_class.call(project: project) }

      it 'succeeds' do
        expect(interactor).to be_a_success
      end

      it 'creates a project authorization for each membership authorized on the parent client' do
        expect { interactor }.to change {
          Authorization.where(subject_class: 'Project', subject_id: project.id).count
        }.by(1)
      end

      it 'uses the parent client memberships' do
        interactor
        project_auth = Authorization.find_by(subject_class: 'Project', subject_id: project.id)
        expect(project_auth.membership_id).to eq(membership.id)
      end
    end

    context 'when adding a report and the project has authorizations' do
      let!(:project_authorization) do
        create(
          :authorization,
          subject_class: 'Project',
          subject_id: project.id,
          membership_id: membership.id
        )
      end

      subject(:interactor) { described_class.call(report: report) }

      it 'creates a report authorization for each membership authorized on the parent project' do
        expect { interactor }.to change {
          Authorization.where(subject_class: 'Report', subject_id: report.id).count
        }.by(1)
      end
    end
  end

  describe 'no-op path (primary failure mode)' do
    context 'when no parent authorizations exist for the instance' do
      subject(:interactor) { described_class.call(project: project) }

      it 'still reports success (interactor short-circuits)' do
        expect(interactor).to be_a_success
      end

      it 'does not create any authorizations' do
        expect { interactor }.to_not change { Authorization.count }
      end
    end

    context 'when no parent authorizations exist for a report' do
      subject(:interactor) { described_class.call(report: report) }

      it 'reports success and creates nothing' do
        expect { interactor }.to_not change { Authorization.count }
        expect(interactor).to be_a_success
      end
    end
  end
end
