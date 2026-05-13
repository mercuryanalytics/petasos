require 'rails_helper'

RSpec.describe Authorizations::UserScopes do
  let!(:user) { create(:user) }

  describe 'success path' do
    context 'when scope is global and scope_state is 1 (add)' do
      let!(:scope) do
        create(:scope, scope: 'user', action: 'admin', global: true)
      end

      subject(:interactor) do
        described_class.call(
          user: user,
          params: { scope_id: scope.id, scope_state: 1 }
        )
      end

      it 'succeeds' do
        expect(interactor).to be_a_success
      end

      it 'attaches the global scope to the user' do
        expect { interactor }.to change { user.reload.scopes.count }.by(1)
        expect(user.scopes).to include(scope)
      end
    end

    context 'when scope is global and scope_state is 0 (remove)' do
      let!(:scope) do
        create(:scope, scope: 'user', action: 'admin', global: true)
      end

      before { user.scopes << scope }

      subject(:interactor) do
        described_class.call(
          user: user,
          params: { scope_id: scope.id, scope_state: 0 }
        )
      end

      it 'detaches the global scope from the user' do
        expect { interactor }.to change { user.reload.scopes.count }.by(-1)
        expect(user.reload.scopes).to_not include(scope)
      end
    end

    context 'when scope_id is not in params' do
      subject(:interactor) do
        described_class.call(
          user: user,
          params: {}
        )
      end

      it 'short-circuits and reports success' do
        expect { interactor }.to_not change { user.reload.scopes.count }
        expect(interactor).to be_a_success
      end
    end
  end

  describe 'failure path' do
    context 'when the scope is not global' do
      let!(:scope) do
        create(:scope, scope: 'user', action: 'admin', global: false)
      end

      subject(:interactor) do
        described_class.call(
          user: user,
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
        expect { interactor }.to_not change { user.reload.scopes.count }
      end
    end
  end
end
