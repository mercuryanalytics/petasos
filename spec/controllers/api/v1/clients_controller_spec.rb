require 'rails_helper'

RSpec.describe Api::V1::ClientsController, type: :controller do
  let(:scopes) { %w[create:clients delete:clients read:clients] }
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
      "iat": 1_582_705_389,
      "exp": 1_582_741_389
    }.with_indifferent_access
  end
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: client) }
  let!(:client_access) { create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id) }

  before do
    allow(JsonWebToken).to receive(:verify) { [user_attrs] }
  end

  let(:valid_attributes) do
    { name: Faker::Name.name }
  end

  let(:invalid_attributes) do
    { something: 'test' }
  end

  describe 'GET #index' do
    let!(:client) { create(:client) }
    let!(:client2) { create(:client) }

    before { get :index }

    subject { response.body }

    it 'returns the user assigned client' do
      expect(subject).to include(client.name)
    end

    xit 'does not show a client on which authorization is not set' do
      expect(subject).not_to include(client2.name)
    end

    xcontext 'when scope is not set' do
      let(:scopes) { %w[create:clients] }

      it 'returns unauthorized' do
        get :index
        expect(response.status).to eq 401
      end
    end
  end

  describe 'GET #show' do
    let!(:client) { create(:client) }
    let!(:client2) { create(:client) }
    let(:scopes) { %w[read:clients] }

    before { get :show, params: { id: client.id } }

    subject { response }

    it 'is succcessful' do
      expect(subject).to be_successful
    end

    it 'returns the client' do
      expect(response.body).to include client.name
    end

    xcontext 'permissions' do
      context 'when the scope is not present' do
        let(:scopes) { %w[something:clients] }

        it 'returns unauthorized' do
          expect(response.status).to eq 401
        end
      end

      context 'when the user does not have permission' do
        let(:scopes) { %w[something:clients] }

        it 'returns unauthorized' do
          get :show, params: { id: client2.id }
          expect(response.status).to eq 401
        end
      end
    end
  end

  describe 'POST #create' do
    context 'with valid params' do
      let(:scopes) { %w[create:clients] }
      let!(:user_scopes) { user.scopes << create(:scope, :client, :admin) }
      let!(:client) { create(:client) }

      subject { post :create, params: { client: valid_attributes } }

      it 'creates a new Client' do
        expect { subject }.to change(Client, :count).by(1)
      end

      it 'adds the permission' do
        expect { subject }.to change(Authorization, :count).by(1)
      end

      it 'renders a JSON response with the new client' do
        subject

        expect(response.body).to include(valid_attributes[:name])
      end
    end

    xcontext 'with invalid params' do
      let(:scopes) { %w[create:clients] }

      subject { post :create, params: { client: invalid_attributes } }

      it 'renders a JSON response with errors for the new client' do
        subject
        expect(response.body).to include 'can\'t be blank'
      end

      it 'returns unprocessable_entity' do
        subject

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    xcontext 'permissions' do
      context 'when scope is missing' do
        let(:scopes) { %w[read:clients] }

        it 'returns unauthorized' do
          post :create, params: { client: valid_attributes }
          expect(response.status).to eq 401
        end
      end
    end
  end

  describe 'PUT #update' do
    let(:new_attributes) do
      { name: 'Test name' }
    end
    let!(:client) { create(:client) }
    let!(:client_scopes) { create(:scope, :client, :update) }
    let!(:client_access) { create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id, scopes: [client_scopes]) }

    context "with valid params" do
      let(:scopes) { %w[update:clients] }

      subject { put :update, params: { id: client.id, client: new_attributes } }

      it 'updates the requested client' do
        expect { subject }.to change { client.reload.name }.to('Test name')
      end

      it 'returns ok status code' do
        subject

        expect(response).to have_http_status(:ok)
      end
    end

    context 'with invalid params' do
      let(:new_attributes) { { client: { name: '' } } }

      it 'renders a JSON response with errors for the client' do
        expect { subject }.not_to(change { client.reload.name })
      end

      it 'returns correct status code' do
        subject

        expect(response).to be_successful
      end
    end

    xcontext 'permissions' do
      context 'when missing scope' do
        let(:scopes) { %w[create:clients] }
        let(:new_attributes) do
          { name: 'Test name' }
        end

        subject { put :update, params: { id: client.id, client: new_attributes } }

        it 'returns unauthorized' do
          subject

          expect(response).to be_unauthorized
        end
      end

      context 'when missing permission' do
        it 'returns unauthorized' do
          put :update, params: { id: client.id, client: new_attributes }

          expect(response.status).to eq 401
        end
      end
    end
  end

  describe 'DELETE #destroy' do
    let!(:client) { create(:client) }
    let(:scopes) { %w[destroy:clients] }
    let!(:client_scopes) { create(:scope, :client, :destroy) }
    let!(:client_access) { create(:client_auth, subject_id: client.id, client_id: client.id, membership_id: membership.id, scopes: [client_scopes]) }

    subject { delete :destroy, params: { id: client.id } }

    it 'destroys the requested client' do
      expect {
        delete :destroy, params: { id: client.id }
      }.to change(Client, :count).by(-1)
    end

    it 'removes the authorizations' do
      expect {
        delete :destroy, params: { id: client.id }
      }.to change(Authorization, :count).by(-1)
    end

    xcontext 'permissions' do
      context 'when scope is missing' do
        let(:scopes) { [] }

        it 'does not delete the client' do
          expect { subject }.not_to change(Client, :count)
        end

        it 'returns unauthorized' do
          subject

          expect(response.status).to eq 401
        end
      end

      context 'when permission is missing' do
        before { client_access.destroy }

        it 'does not delete the client' do
          expect { subject }.not_to change(Client, :count)
        end

        it 'returns unauthorized' do
          subject

          expect(response.status).to eq 401
        end
      end
    end
  end
end
