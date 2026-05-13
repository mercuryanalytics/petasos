require 'rails_helper'

RSpec.describe Reports::UpdateReportOrganizer, type: :interactor do
  let!(:project) { create(:project) }
  let!(:report) { create(:report, project: project, name: 'Old name') }

  subject(:interactor) { described_class.call(params: params, report: report) }

  context 'with valid params' do
    let(:params) { { name: 'Brand new name' } }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'updates the report name in the database' do
      interactor
      expect(report.reload.name).to eq('Brand new name')
    end

    it 'exposes the updated report on the context' do
      expect(interactor.report).to eq(report)
      expect(interactor.report.name).to eq('Brand new name')
    end
  end

  context 'with invalid params (validation failure)' do
    let(:params) { { name: nil } }

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not modify the report' do
      original_name = report.name
      interactor
      expect(report.reload.name).to eq(original_name)
    end

    it 'exposes the validation errors on context.message' do
      expect(interactor.message).to be_a(ActiveModel::Errors)
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
