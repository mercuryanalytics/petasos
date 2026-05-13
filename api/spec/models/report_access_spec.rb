require 'rails_helper'

RSpec.describe ReportAccess, type: :model do
  it { should belong_to :report }

  describe 'report association' do
    let(:client) { create(:client) }
    let(:project) { create(:project, client: client) }
    let(:report) { create(:report, project: project) }

    it 'is valid with a report' do
      report_access = build(:report_access, report_id: report.id, account_id: 'user-1')
      expect(report_access).to be_valid
    end

    it 'is invalid without a report' do
      report_access = build(:report_access, report_id: nil, account_id: 'user-1')
      expect(report_access).not_to be_valid
    end

    it 'returns the associated report' do
      report_access = create(:report_access, report_id: report.id, account_id: 'user-1')
      expect(report_access.report).to eq(report)
    end
  end
end
