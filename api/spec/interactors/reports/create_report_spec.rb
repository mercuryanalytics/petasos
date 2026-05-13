require 'rails_helper'

RSpec.describe Reports::CreateReport do
  let!(:project) { create(:project) }

  subject(:interactor) { described_class.call(report: report) }

  context 'when the report is valid' do
    let(:report) { build(:report, project: project) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'persists the report' do
      expect { interactor }.to change { Report.count }.by(1)
    end

    it 'exposes the persisted report on the context' do
      expect(interactor.report).to be_persisted
    end
  end

  context 'when the report is invalid' do
    let(:report) { build(:report, name: nil, project: project) }

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not persist the report' do
      expect { interactor }.not_to change { Report.count }
    end

    it 'exposes the validation errors on context.message' do
      expect(interactor.message).to be_a(ActiveModel::Errors)
      expect(interactor.message[:name]).to include("can't be blank")
    end
  end
end
