require 'rails_helper'

RSpec.describe Authorizations::DynamicScope do
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

  describe 'success path' do
    let!(:scope) do
      create(:scope, scope: 'projects', action: 'read', dynamic: true)
    end

    context 'when scope_state is 1 (add)' do
      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: { scope_id: scope.id, scope_state: 1 }
        )
      end

      it 'succeeds' do
        expect(interactor).to be_a_success
      end

      it 'attaches the scope to the authorization' do
        expect { interactor }.to change { authorization.reload.scopes.count }.by(1)
        expect(authorization.scopes).to include(scope)
      end
    end

    context 'when scope_state is 0 (remove)' do
      before { authorization.scopes << scope }

      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: { scope_id: scope.id, scope_state: 0 }
        )
      end

      it 'detaches the scope from the authorization' do
        expect { interactor }.to change { authorization.reload.scopes.count }.by(-1)
        expect(authorization.reload.scopes).to_not include(scope)
      end
    end

    context 'when scope_id is not in params' do
      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: {}
        )
      end

      it 'short-circuits and reports success without changing scopes' do
        expect { interactor }.to_not change { authorization.reload.scopes.count }
        expect(interactor).to be_a_success
      end
    end
  end

  describe 'failure path' do
    context 'when the scope is the wrong type for the authorization subject' do
      let!(:scope) do
        create(:scope, scope: 'reports', action: 'read', dynamic: true)
      end

      subject(:interactor) do
        described_class.call(
          authorization: authorization,
          params: { scope_id: scope.id, scope_state: 1 }
        )
      end

      it 'fails the context' do
        expect(interactor).to be_a_failure
      end

      it 'exposes the failure message' do
        expect(interactor.message).to eq('Wrong scope type for the given resource')
      end

      it 'does not attach the scope' do
        expect { interactor }.to_not change { authorization.reload.scopes.count }
      end
    end
  end
end
