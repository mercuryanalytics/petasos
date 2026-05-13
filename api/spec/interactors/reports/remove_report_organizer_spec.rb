require 'rails_helper'

RSpec.describe Reports::RemoveReportOrganizer, type: :interactor do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:user) { create(:user, clients: [client]) }
  let(:membership) { user.memberships.first }
  let!(:report) { create(:report, project: project) }

  context 'when there is an existing report authorization and we pass its membership_id' do
    let!(:authorization) do
      Authorization.create!(
        subject_class: 'Report',
        subject_id: report.id,
        membership_id: membership.id,
        client_id: client.id
      )
    end

    subject(:interactor) { described_class.call(report: report, membership_id: membership.id) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys the report' do
      expect { interactor }.to change { Report.exists?(report.id) }.from(true).to(false)
    end

    it 'destroys the matching report authorization' do
      expect { interactor }
        .to change { Authorization.exists?(authorization.id) }.from(true).to(false)
    end
  end

  context 'when no membership_id is supplied (primary failure mode for the authorization step)' do
    subject(:interactor) { described_class.call(report: report, membership_id: nil) }

    it 'still completes successfully because RemoveAuthorization early-returns without a membership_id' do
      expect(interactor).to be_a_success
    end

    it 'still destroys the report' do
      expect { interactor }.to change { Report.exists?(report.id) }.from(true).to(false)
    end

    it 'does not destroy unrelated authorizations' do
      other_report = create(:report, project: project)
      other_auth = Authorization.create!(
        subject_class: 'Report',
        subject_id: other_report.id,
        membership_id: membership.id,
        client_id: client.id
      )

      expect { interactor }
        .not_to change { Authorization.exists?(other_auth.id) }
    end
  end
end
