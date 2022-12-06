require 'rails_helper'

RSpec.describe Api::V1::ReportsController, type: :controller do
  let(:user_attrs) do
    {
      "http://localhost:3001user_authorization": {
        "permissions": scopes
      },
      "nickname": "username",
      "name": "user@mail.tld",
      "picture": "https://s.gravatar.com/avatar/05b477bb4bccffd10d89d3fd1de62899?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fb.png",
      "updated_at": "2020-02-24T13:46:37.082Z",
      "email": user.email,
      "email_verified": true,
      "iss": "https://iss/",
      "sub": "auth0|5e43e382c452940d9fce740f",
      "aud": "ze875woECaoiRt7Vp2561p4uf57zp9e1",
      "iat": 1582705389,
      "exp": 1582741389
    }.with_indifferent_access
  end
  let(:client) { create(:client) }
  let!(:user) { create(:user, clients: [client]) }
  let!(:project) { create(:project, client: client) }
  let!(:project_2) { create(:project, client: client) }
  let!(:user_scopes) { user.scopes << scopes }

  before do
    allow(JsonWebToken).to receive(:verify) { [user_attrs] }
  end

  describe '#index' do
    let!(:report) { create(:report, project_id: project.id) }
    let!(:report_2) { create(:report, project_id: project.id) }
    let!(:report_3) { create(:report, project_id: project_2.id) }
    let!(:report_access) { create(:report_auth, subject_id: report.id, membership_id: user.membership_ids.first, user_id: user.id) }
    let!(:scopes) { create(:scope, :report, :read) }
    let!(:report_4) { create(:report, project: create(:project, client: create(:client))) }
    let!(:report_access_2) { create(:report_auth, subject_id: report_4.id, membership_id: user.membership_ids.first, user_id: user.id) }

    it 'returns only the accessible reports' do
      get :index, params: { project_id: project.id }

      expect(response.body).to include report.name
      # expect(response.body).to_not include report_2.name
      # expect(response.body).to_not include report_3.name
    end

    it 'returns the report for other client, when authorized' do
      get :index, params: { project_id: report_4.project_id }
      expect(response.body).to include report_4.name
    end
  end

  describe '#create' do
    let!(:scopes) { create(:scope, :client, :authorize) }
    let!(:client_access) { create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: user.membership_ids.first, user_id: user.id, scopes: [scopes]) }

    let(:params) do
      {
        report: {
          name: 'Report',
          description: 'Report Description',
          project_id: project.id
        }
      }
    end

    it 'creates the new report' do
      expect { post :create, params: { project_id: project.id, **params } }.to change { Report.count }.by(1)
    end

    it 'creates the project access instance' do
      expect { post :create, params: { project_id: project.id, **params } }.to change { Authorization.count }.by(1)
    end

    xcontext 'when the user does not have permission' do
      let(:scopes) { [] }

      before { post :create, params: { project_id: project.id, **params } }

      it 'returns unauthorized status code' do
        expect(response.status).to eq 401
      end

      it 'returns the unauthorized body' do
        expect(response.body).to eq({ errors: 'You are not authorized' }.to_json)
      end
    end
  end

  describe '#update' do
    let!(:scopes) { create(:scope, :report, :update) }
    let!(:report) { create(:report, project_id: project.id) }
    let!(:report_access) { create(:report_auth, subject_id: report.id, membership_id: user.membership_ids.first, user_id: user.id, scopes: [scopes]) }
    let(:params) do
      {
        report: {
          name: 'Report 2'
        }
      }
    end

    it 'updates the report' do
      expect { patch :update, params: { project_id: project.id, id: report.id, **params } }
        .to change { report.reload.name }.to('Report 2')
    end

    xdescribe 'unauthorized' do
      context 'when the scope is missing' do
        let(:scopes) { [] }

        it 'returns unauthorized' do
          patch :update, params: { project_id: project.id, id: report.id, **params }

          expect(response.status).to eq 401
        end
      end

      context 'when project access is missing' do
        before { report_access.destroy }

        it 'returns unauthorized' do
          patch :update, params: { project_id: project.id, id: report.id, **params }

          expect(response.status).to eq 401
        end
      end
    end
  end

  describe '#delete' do
    let!(:scopes) { create(:scope, :report, :destroy) }
    let!(:report) { create(:report, project_id: project.id) }
    let!(:report_access) { create(:report_auth, subject_id: report.id, user_id: user.id, membership_id: user.membership_ids.first, scopes: [scopes]) }

    it 'deletes the record' do
      expect { delete :destroy, params: { project_id: project.id, id: report.id } }.to change { Report.count }.from(1).to(0)
      expect(response.status).to eq 200
    end

    it 'deletes the authorizations' do
      expect { delete :destroy, params: { project_id: project.id, id: report.id } }.to change { Authorization.count }.from(1).to(0)
    end

    xcontext 'unauthorized' do
      context 'when the scope is missing' do
        let(:scopes) { [] }

        it 'returns unauthorized' do
          delete :destroy, params: { project_id: project.id, id: report.id }

          expect(response.status).to eq 401
        end
      end

      context 'when project access is missing' do
        before { report_access.destroy }

        it 'returns unauthorized' do
          delete :destroy, params: { project_id: project.id, id: report.id }

          expect(response.status).to eq 401
        end
      end
    end
  end
end
