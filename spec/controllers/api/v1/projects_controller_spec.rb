require 'rails_helper'

RSpec.describe Api::V1::ProjectsController, type: :controller do
  let!(:client) { create(:client) }
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
            "exp": 1582741389,
            "user_metadata": { "client_id": client.uuid }
        }.with_indifferent_access
  end
  let!(:user) { create(:user, clients: [client]) }
  let!(:user_scopes) { user.scopes << scopes }
  let!(:membership) { create(:membership, user: user, client: client) }

  before do
    allow(JsonWebToken).to receive(:verify) { [user_attrs] }
  end

  describe '#index' do
    let!(:scopes) { create(:scope, :project, :read) }
    let!(:project) { create(:project) }
    let!(:project_2) { create(:project) }
    let!(:project_access) { create(:project_auth, subject_id: project.id, membership_id: membership.id, user_id: user.id) }

    before { get :index }

    it 'returns only the accessible projects' do
      expect(response.body).to include project.name
    end

    xit 'does not return a project which is inaccessible' do
      expect(response.body).to_not include project_2.name
    end
  end

  describe '#create' do
    let!(:scopes) { create(:scope, :project, :admin) }

    let(:params) do
      {
        project: {
          name: 'Project',
          description: 'Project Description',
          project_number: 'Project no1',
          project_type: Project::PROJECT_TYPES.sample,
          account_id: 'test id',
          domain_id: client.id
        }
      }
    end

    it 'creates the new project' do
      expect { post :create, params: params }.to change { Project.count }.by(1)
    end

    it 'creates the project access instance' do
      expect { post :create, params: params }.to change { Authorization.count }.by(1)
    end

    xcontext 'when the user does not have permission' do
      before do
        scopes.destroy
        post :create, params: params
      end

      it 'returns unauthorized status code' do
        expect(response.status).to eq 401
      end

      it 'returns the unauthorized body' do
        expect(response.body).to eq({ errors: 'You are not authorized' }.to_json)
      end
    end
  end

  describe '#update' do
    let!(:scopes) { create(:scope, :project, :update) }
    let!(:project) { create(:project) }
    let!(:project_access) { create(:project_auth, subject_id: project.id, membership_id: membership.id, user_id: user.id, scopes: [scopes]) }
    let(:project_params) do
      {
        project: {
          name: 'Project 2',
          modified_on: '2014-10-10'
        }
      }
    end

    it 'updates the project' do
      expect { patch :update, params: { id: project.id, **project_params } }
        .to change { project.reload.name }.to('Project 2')
    end

    it 'updates the modified on' do
      expect { patch :update, params: { id: project.id, **project_params } }
        .to change { project.reload.modified_on.to_s }.to('2014-10-10')
    end

    xdescribe 'unauthorized' do
      context 'when the scope is missing' do
        before { scopes.destroy }

        it 'returns unauthorized' do
          patch :update, params: { id: project.id, **project_params }

          expect(response.status).to eq 401
        end
      end

      context 'when project access is missing' do
        before { project_access.destroy }

        it 'returns unauthorized' do
          patch :update, params: { id: project.id, **project_params }

          expect(response.status).to eq 401
        end
      end
    end
  end

  describe '#delete' do
    let!(:scopes) { create(:scope, :project, :destroy) }
    let!(:user_2) { create(:user) }
    let!(:project) { create(:project) }
    let!(:project_access) { create(:project_auth, subject_id: project.id, user_id: user.id, membership_id: membership.id, scopes: [scopes]) }
    let!(:membership_2) { create(:membership, user: user_2, client: client) }
    let!(:project_access_2) { create(:project_auth, subject_id: project.id, user_id: user_2.id, membership_id: membership_2.id, scopes: [scopes]) }

    it 'deletes the record' do
      expect { delete :destroy, params: { id: project.id } }.to change { Project.count }.from(1).to(0)
      expect(response.status).to eq 200
    end

    it 'deletes the authorizations' do
      expect { delete :destroy, params: { id: project.id } }.to change { Authorization.count }.from(2).to(0)
    end

    context 'unauthorized' do
      context 'when the scope is missing' do
        before { scopes.destroy }

        it 'returns unauthorized' do
          delete :destroy, params: { id: project.id }

          expect(response.status).to eq 401
        end
      end

      context 'when project access is missing' do
        before { project_access.destroy }

        it 'returns unauthorized' do
          delete :destroy, params: { id: project.id }

          expect(response.status).to eq 401
        end
      end
    end
  end
end
