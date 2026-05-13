require 'rails_helper'

RSpec.describe Reports::ValidateReport do
  let!(:project) { create(:project) }

  subject(:interactor) { described_class.call(params: params) }

  context 'with valid params' do
    let(:params) do
      { name: 'Q3 Findings', description: 'A report', project_id: project.id }
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'assigns the built report to context.report' do
      expect(interactor.report).to be_a(Report)
      expect(interactor.report.name).to eq('Q3 Findings')
      expect(interactor.report.project_id).to eq(project.id)
    end

    it 'does not persist the report' do
      expect { interactor }.not_to change { Report.count }
      expect(interactor.report).to be_new_record
    end
  end

  context 'with invalid params' do
    let(:params) { { name: nil, project_id: project.id } }

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the validation errors on context.message' do
      expect(interactor.message).to be_a(ActiveModel::Errors)
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
