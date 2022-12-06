require 'rails_helper'

RSpec.describe Scopes::Role do
  subject(:interactor) { described_class.call(role: role) }
  let!(:scopes) do
    %i(user domain client project report).collect do |resource|
      %i(create update destroy authorize authorized).collect do |action|
        create(:scope, resource, action)
      end
    end
  end
  let(:interactor_scopes) { interactor.scopes.select { |i| i.scope == resource }}

  describe 'unknown role' do
    let(:role) { 'unknown' }

    it 'fails' do
      expect(interactor).to be_a_failure
    end

    it 'returns the error message' do
      expect(interactor.message).to eq 'No role could be found'
    end
  end

  describe 'client_manager' do
    let(:role) { described_class::CLIENT_MANAGER_ROLE }
    let(:correct_scopes) do
      Scope.for_project.where(action: 'update') +
        Scope.for_report.where(action: 'update') +
        Scope.for_client.where(action: 'update') +
        Scope.for_domain.where.not(
          action: [
                    described_class::AUTHORIZE_ACTION,
                    described_class::AUTHORIZED_ACTION,
                    described_class::INVITE_ACTION
                  ]
        ) + Scope.for_user.where.not(
        action: [
                  described_class::AUTHORIZE_ACTION,
                  described_class::AUTHORIZED_ACTION,
                  described_class::INVITE_ACTION
                ]
      )
    end

    it 'returns correct scopes' do
      expect(interactor.scopes).to match_array(correct_scopes)
    end

    context 'client scopes' do
      let(:resource) { 'client' }

      it 'returns one scope' do
        expect(interactor_scopes.size).to eq(1)
      end

      it 'returns the update scope' do
        expect(interactor_scopes).to eq([Scope.find_by(scope: 'client', action: 'update')])
      end
    end

    context 'project scopes' do
      let(:resource) { 'project' }

      it 'returns one scope' do
        expect(interactor_scopes.size).to eq(1)
      end

      it 'returns the update scope' do
        expect(interactor_scopes).to eq([Scope.find_by(scope: 'project', action: 'update')])
      end
    end

    context 'report scopes' do
      let(:resource) { 'report' }

      it 'returns one scope' do
        expect(interactor_scopes.size).to eq(1)
      end

      it 'returns the update scope' do
        expect(interactor_scopes).to eq([Scope.find_by(scope: 'report', action: 'update')])
      end
    end

    context 'user scopes' do
      let(:resource) { 'user' }

      it 'returns three scopes' do
        expect(interactor_scopes.size).to eq(3)
      end

      it 'returns all scopes' do
        expect(interactor_scopes).to eq(Scope.where.not(action: %w(authorize authorized invite)).for_user.to_a)
      end
    end

    context 'domain scopes' do
      let(:resource) { 'domain' }

      it 'returns three scopes' do
        expect(interactor_scopes.size).to eq(3)
      end

      it 'returns all scopes' do
        expect(interactor_scopes).to eq(Scope.where.not(action: %w(authorize authorized invite)).for_domain.to_a)
      end
    end
  end

  describe 'client_admin' do
    let(:role) { described_class::CLIENT_ADMIN_ROLE }
    let(:resource) { 'client' }
    let(:correct_scopes) {
      Scope.for_client.where(
        action: [
            described_class::AUTHORIZE_ACTION,
            described_class::AUTHORIZED_ACTION,
            described_class::INVITE_ACTION
          ]
      )
    }

    it 'returns the correct scopes' do
      expect(interactor_scopes).to match_array correct_scopes
    end
  end

  describe 'project_admin' do
    let(:role) { described_class::PROJECT_ADMIN_ROLE }
    let(:resource) { 'project' }
    let(:correct_scopes) {
      Scope.for_project.where(
        action: [
                  described_class::AUTHORIZE_ACTION,
                  described_class::AUTHORIZED_ACTION,
                  described_class::INVITE_ACTION
                ]
      )
    }

    it 'returns the correct scopes' do
      expect(interactor_scopes).to match_array correct_scopes
    end
  end

  describe 'project_manager' do
    let(:role) { described_class::PROJECT_MANAGER_ROLE }
    let(:correct_scopes) do
      Scope.for_project.where.not(
        action: [
                  described_class::AUTHORIZE_ACTION,
                  described_class::AUTHORIZED_ACTION,
                  described_class::INVITE_ACTION
                ]
      ) + Scope.for_report.where.not(
        action: [
                  described_class::AUTHORIZE_ACTION,
                  described_class::AUTHORIZED_ACTION,
                  described_class::INVITE_ACTION
                ]
      )
    end

    it 'returns the correct scopes' do
      expect(interactor.scopes).to match_array correct_scopes
    end

    context 'project scopes' do
      let(:resource) { 'project' }

      it 'returns three scope' do
        expect(interactor_scopes.size).to eq(3)
      end

      it 'returns the update scope' do
        expect(interactor_scopes).to match_array(Scope.for_project.where(action: %w(create update destroy)).to_a)
      end
    end

    context 'report scopes' do
      let(:resource) { 'report' }

      it 'returns three scope' do
        expect(interactor_scopes.size).to eq(3)
      end

      it 'returns the update scope' do
        expect(interactor_scopes).to match_array(Scope.for_report.where(action: %w(create update destroy)).to_a)
      end
    end
  end

  describe 'report_admin' do
    let(:role) { described_class::REPORT_ADMIN_ROLE }
    let(:resource) { 'report' }
    let(:correct_scopes) {
      Scope.for_report.where(
        action: [
                  described_class::AUTHORIZE_ACTION,
                  described_class::AUTHORIZED_ACTION,
                  described_class::INVITE_ACTION
                ]
      )
    }

    it 'returns the correct scopes' do
      expect(interactor_scopes).to match_array correct_scopes
    end
  end

  describe 'report_manager' do
    let(:role) { described_class::REPORT_MANAGER_ROLE }
    let(:correct_scopes) { Scope.for_report.where(action: 'update') }

    it 'returns the correct scopes' do
      expect(interactor.scopes).to match_array correct_scopes
    end
  end
end
