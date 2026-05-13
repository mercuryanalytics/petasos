require 'rails_helper'

RSpec.describe Reports::CreateReportOrganizer, type: :interactor do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:user) { create(:user, clients: [client]) }
  let(:params) do
    {
      name: 'A New Report',
      description: 'Initial findings',
      project_id: project.id
    }
  end

  subject(:interactor) { described_class.call(params: params, user: user) }

  context 'with valid params and an authorizable user' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'creates a new report' do
      expect { interactor }.to change { Report.count }.by(1)
    end

    it 'creates an authorization for the new report on the user membership' do
      expect { interactor }.to change { Authorization.where(subject_class: 'Report').count }.by(1)

      authorization = Authorization.where(subject_class: 'Report').last
      expect(authorization.subject_id).to eq(interactor.report.id)
      expect(authorization.membership_id).to eq(user.memberships.first.id)
    end

    it 'exposes the persisted report on the context' do
      expect(interactor.report).to be_persisted
      expect(interactor.report.name).to eq('A New Report')
    end
  end

  context 'with invalid params (validation failure)' do
    let(:params) do
      { name: nil, description: 'Initial findings', project_id: project.id }
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not create a report' do
      expect { interactor }.not_to change { Report.count }
    end

    it 'does not create an authorization' do
      expect { interactor }.not_to change { Authorization.count }
    end

    it 'exposes the validation errors on context.message' do
      expect(interactor.message).to be_a(ActiveModel::Errors)
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
