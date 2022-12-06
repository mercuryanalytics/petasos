require 'rails_helper'

RSpec.describe Clients::TemplateManager do
  let!(:client) { create(:client) }
  let(:params) { { client_id: client.id, resource_type: resource_type, resource_id: resource_id, state: state } }

  subject(:interactor) { described_class.call(params: params) }

  describe 'invalid data' do
    context 'with invalid params' do
      let(:params) { { test: 'test' } }

      it 'is not successful' do
        expect(interactor).to be_a_failure
      end

      it 'returns the message' do
        expect(interactor.message).to eq 'Not all attributes present'
      end
    end

    context 'with missing client_id' do
      let(:params) { { resource_type: 'project', resource_id: 1, state: 1 } }

      it 'is not successful' do
        expect(interactor).to be_a_failure
      end

      it 'returns the message' do
        expect(interactor.message).to eq 'Not all attributes present'
      end
    end

    context 'with missing resource_type param' do
      let(:params) { { client_id: client.id, resource_id: 1, state: 1 } }

      it 'is not successful' do
        expect(interactor).to be_a_failure
      end

      it 'returns the message' do
        expect(interactor.message).to eq 'Not all attributes present'
      end
    end

    context 'with missing resource_id param' do
      let(:params) { { client_id: client.id, resource_type: 'client', state: 1 } }

      it 'is not successful' do
        expect(interactor).to be_a_failure
      end

      it 'returns the message' do
        expect(interactor.message).to eq 'Not all attributes present'
      end
    end

    context 'with missing state param' do
      let(:params) { { client_id: client.id, resource_type: 'client', resource_id: 1 } }

      it 'is not successful' do
        expect(interactor).to be_a_failure
      end

      it 'returns the message' do
        expect(interactor.message).to eq 'Not all attributes present'
      end
    end
  end
  describe 'valid data' do
    context 'client authorization' do
      let(:resource_type) { 'client' }
      let(:resource_id) { client.id }

      context 'adding authorization' do
        let(:state) { 1 }

        it 'is successful' do
          expect(interactor).to be_a_success
        end

        it 'creates a new authorization' do
          expect { interactor }.to change { Authorization.count }.from(0).to(1)
        end

        it 'adds the correct authorization' do
          interactor
          authorization = Authorization.last
          expect(authorization.subject_id).to eq resource_id
          expect(authorization.subject_class).to eq 'Client'
          expect(authorization.client_id).to eq client.id
          expect(authorization.membership_id).to be_nil
          expect(authorization.user_id).to be_nil
        end
      end

      context 'removing authorization' do
        let!(:authorization) do
          create(:authorization, subject_class: 'Client', subject_id: client.id, client_id: client.id)
        end
        let(:state) { 0 }

        it 'is successful' do
          expect(interactor).to be_a_success
        end

        it 'removes the authorization' do
          expect { interactor }.to change { Authorization.count }.from(1).to(0)
        end
      end
    end
    context 'project authorization' do
      let!(:project) { create(:project) }
      let(:resource_type) { 'project' }
      let(:resource_id) { project.id }

      context 'adding authorization' do
        let(:state) { 1 }

        it 'is successful' do
          expect(interactor).to be_a_success
        end

        it 'creates a new authorization' do
          expect { interactor }.to change { Authorization.count }.from(0).to(1)
        end

        it 'adds the correct authorization' do
          interactor
          authorization = Authorization.last
          expect(authorization.subject_id).to eq resource_id
          expect(authorization.subject_class).to eq 'Project'
          expect(authorization.client_id).to eq client.id
          expect(authorization.membership_id).to be_nil
          expect(authorization.user_id).to be_nil
        end
      end

      context 'removing authorization' do
        let!(:authorization) do
          create(:authorization, subject_class: 'Project', subject_id: project.id, client_id: client.id)
        end
        let(:state) { 0 }

        it 'is successful' do
          expect(interactor).to be_a_success
        end

        it 'removes the authorization' do
          expect { interactor }.to change { Authorization.count }.from(1).to(0)
        end
      end
    end
    context 'report authorization' do
      let!(:report) { create(:report, project: create(:project)) }
      let(:resource_type) { 'report' }
      let(:resource_id) { report.id }

      context 'adding authorization' do
        let(:state) { 1 }

        it 'is successful' do
          expect(interactor).to be_a_success
        end

        it 'creates a new authorization' do
          expect { interactor }.to change { Authorization.count }.from(0).to(1)
        end

        it 'adds the correct authorization' do
          interactor
          authorization = Authorization.last
          expect(authorization.subject_id).to eq resource_id
          expect(authorization.subject_class).to eq 'Report'
          expect(authorization.client_id).to eq client.id
          expect(authorization.membership_id).to be_nil
          expect(authorization.user_id).to be_nil
        end
      end

      context 'removing authorization' do
        let!(:authorization) do
          create(:authorization, subject_class: 'Report', subject_id: report.id, client_id: client.id)
        end
        let(:state) { 0 }

        it 'is successful' do
          expect(interactor).to be_a_success
        end

        it 'removes the authorization' do
          expect { interactor }.to change { Authorization.count }.from(1).to(0)
        end
      end
    end
  end
end
