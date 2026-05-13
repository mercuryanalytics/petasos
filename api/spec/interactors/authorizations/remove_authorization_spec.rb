require 'rails_helper'

RSpec.describe Authorizations::RemoveAuthorization do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: client) }

  describe 'success path' do
    context 'when a matching authorization exists' do
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
          membership_id: membership.id
        )
      end

      it 'succeeds' do
        expect(interactor).to be_a_success
      end

      it 'destroys the matching authorization' do
        expect { interactor }.to change { Authorization.count }.by(-1)
        expect(Authorization.where(id: authorization.id)).to be_empty
      end
    end

    context 'when no matching authorization exists' do
      subject(:interactor) do
        described_class.call(
          project: project,
          membership_id: membership.id
        )
      end

      it 'succeeds and does nothing' do
        expect { interactor }.to_not change { Authorization.count }
        expect(interactor).to be_a_success
      end
    end
  end

  describe 'no-op path (primary "failure" mode)' do
    context 'when membership_id is missing' do
      let!(:authorization) do
        create(
          :authorization,
          subject_class: 'Project',
          subject_id: project.id,
          membership_id: membership.id
        )
      end

      subject(:interactor) do
        described_class.call(project: project)
      end

      it 'short-circuits without destroying anything' do
        expect { interactor }.to_not change { Authorization.count }
      end

      it 'still reports success' do
        expect(interactor).to be_a_success
      end
    end
  end
end
