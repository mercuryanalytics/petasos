require 'rails_helper'

RSpec.describe Authorizations::AddClientDefaultAuthorizations do
  let!(:client) { create(:client, default_template_enabled: default_template_enabled) }
  let(:default_template_enabled) { true }
  let!(:project_1) { create(:project, client: client) }
  let!(:project_2) { create(:project, client: client) }
  let!(:report_1_p_1) { create(:report, project: project_1) }
  let!(:report_2_p_1) { create(:report, project: project_1) }
  let!(:report_1_p_2) { create(:report, project: project_2) }
  let!(:report_2_p_2) { create(:report, project: project_2) }
  let!(:user) { create(:user, clients: [client]) }
  let(:no_auth) { 1 }
  let!(:client_authorizations) do
    client.authorizations << create(:authorization, subject_class: 'Project', subject_id: project_1.id)
    client.authorizations << create(:authorization, subject_class: 'Report', subject_id: report_1_p_1.id)
    client.authorizations << create(:authorization, subject_class: 'Report', subject_id: report_1_p_2.id)
    client.authorizations
  end

  subject(:interactor) { described_class.call(user: user, no_auth: no_auth, client: client) }

  describe 'invalid data' do
    context 'client is not present' do
      before { client.destroy }

      it 'does nothing' do
        expect { interactor }.to_not change { Authorization.count }
      end
    end

    context 'when no_auth is 0' do
      let(:no_auth) { 0 }
      it 'does nothing' do
        expect { interactor }.to_not change { Authorization.count }
      end
    end

    context 'when default_template_enabled is false' do
      let(:default_template_enabled) { false }

      it 'does nothing' do
        expect { interactor }.to_not change { Authorization.count }
      end
    end
  end

  context 'with valid data' do
    it 'adds the authorizations' do
      expect { interactor }.to change { Authorization.count }.from(3).to(6)
    end

    it 'the authorizations are the same as client defaults' do
      interactor
      membership_authorizations = user.memberships.first.authorizations.pluck(:subject_id, :subject_class)
      expect(membership_authorizations).to match_array(client_authorizations.pluck(:subject_id, :subject_class))
    end
  end
end
