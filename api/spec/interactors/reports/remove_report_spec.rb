require 'rails_helper'

RSpec.describe Reports::RemoveReport do
  let!(:project) { create(:project) }

  subject(:interactor) { described_class.call(report: report) }

  context 'when the report is persisted' do
    let!(:report) { create(:report, project: project) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'destroys the report' do
      expect { interactor }.to change { Report.count }.by(-1)
    end

    it 'marks the in-memory report as destroyed' do
      interactor
      expect(report).to be_destroyed
    end
  end

  context 'when the report is a new (unpersisted) record' do
    let(:report) { build(:report, project: project) }

    it 'still completes successfully without removing any reports' do
      expect { interactor }.not_to change { Report.count }
      expect(interactor).to be_a_success
    end
  end
end
