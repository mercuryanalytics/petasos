require 'rails_helper'

RSpec.describe Authorizations::RoleSetter do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: client) }
  let!(:authorization) do
    create(
      :authorization,
      subject_class: 'Project',
      subject_id: project.id,
      membership_id: membership.id
    )
  end

  # Seed the data-level scopes used by Scopes::Role for each role lookup.
  let!(:scopes) do
    %i(user domain client project report).collect do |resource|
      %i(create update destroy authorize authorized).collect do |action|
        create(:scope, resource, action)
      end
    end
  end

  describe 'success path' do
    context 'when role_state is 1 (add) with project_manager role' do
      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: { role: Scopes::Role::PROJECT_MANAGER_ROLE, role_state: 1 }
        )
      end

      it 'succeeds' do
        expect(interactor).to be_a_success
      end

      it 'attaches the project_manager scopes to the authorization' do
        interactor
        attached_scope_ids = authorization.reload.scopes.pluck(:id).sort
        expected_scope_ids = (
          Scope.for_project.where(action: %w(create update destroy)) +
            Scope.for_report.where(action: %w(create update destroy))
        ).map(&:id).sort
        expect(attached_scope_ids).to eq(expected_scope_ids)
      end
    end

    context 'when role_state is 0 (remove)' do
      before do
        attach_scopes = Scope.for_project.where(action: %w(create update destroy)) +
                        Scope.for_report.where(action: %w(create update destroy))
        authorization.scopes << attach_scopes
      end

      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: { role: Scopes::Role::PROJECT_MANAGER_ROLE, role_state: 0 }
        )
      end

      it 'detaches the project_manager scopes from the authorization' do
        expect { interactor }.to change { authorization.reload.scopes.count }.to(0)
      end
    end

    context 'when role is not in params' do
      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: {}
        )
      end

      it 'short-circuits and reports success' do
        expect { interactor }.to_not change { authorization.reload.scopes.count }
        expect(interactor).to be_a_success
      end
    end
  end

  describe 'failure path' do
    context 'when the role is unknown' do
      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: { role: 'not_a_real_role', role_state: 1 }
        )
      end

      it 'fails the context' do
        expect(interactor).to be_a_failure
      end

      it 'exposes the underlying Scopes::Role error message' do
        expect(interactor.message).to eq('No role could be found')
      end

      it 'does not attach any scopes' do
        expect { interactor }.to_not change { authorization.reload.scopes.count }
      end
    end
  end
end
