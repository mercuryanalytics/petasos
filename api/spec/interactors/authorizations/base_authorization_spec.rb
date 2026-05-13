require 'rails_helper'

RSpec.describe Authorizations::BaseAuthorization do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: client) }

  describe 'success path' do
    context 'with an authorize: true request for a project' do
      subject(:interactor) do
        described_class.call(
          project: project,
          params: { user_id: user.id, client_id: client.id, authorize: true }
        )
      end

      it 'succeeds' do
        expect(interactor).to be_a_success
      end

      it 'sets status to :ok on the context' do
        expect(interactor.status).to eq(:ok)
      end

      it 'creates the project authorization for the membership' do
        expect { interactor }.to change {
          Authorization.where(subject_class: 'Project', subject_id: project.id).count
        }.by(1)
      end
    end

    context 'with an authorize: false request for a project (remove)' do
      let!(:authorization) do
        create(
          :authorization,
          subject_class: 'Project',
          subject_id: project.id,
          membership_id: membership.id
        )
      end

      subject(:interactor) do
        described_class.call(
          project: project,
          params: { user_id: user.id, client_id: client.id, authorize: false }
        )
      end

      it 'succeeds with status :ok' do
        expect(interactor).to be_a_success
        expect(interactor.status).to eq(:ok)
      end

      it 'destroys the matching project authorization' do
        expect { interactor }.to change {
          Authorization.where(subject_class: 'Project', subject_id: project.id).count
        }.by(-1)
      end
    end

    context 'with no role/scope/access/authorize params' do
      subject(:interactor) do
        described_class.call(
          project: project,
          params: { user_id: user.id, client_id: client.id }
        )
      end

      it 'succeeds and only sets status :ok (no-op flow)' do
        expect { interactor }.to_not change { Authorization.count }
        expect(interactor).to be_a_success
        expect(interactor.status).to eq(:ok)
      end
    end
  end

  describe 'failure path' do
    context 'when authorize: true is requested with no client/project/report' do
      subject(:interactor) do
        described_class.call(
          params: { user_id: user.id, client_id: client.id, authorize: true }
        )
      end

      it 'fails the context' do
        expect(interactor).to be_a_failure
      end

      it 'exposes the failure message' do
        expect(interactor.message).to eq('wrong instance supplied')
      end
    end
  end
end
