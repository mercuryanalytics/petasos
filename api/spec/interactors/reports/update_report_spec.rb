require 'rails_helper'

RSpec.describe Reports::UpdateReport do
  let!(:project) { create(:project) }
  let!(:report) { create(:report, project: project, name: 'Original name') }

  subject(:interactor) { described_class.call(report: report) }

  context 'when the (mutated) report is valid' do
    before { report.assign_attributes(name: 'Updated name') }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'persists the change' do
      interactor
      expect(report.reload.name).to eq('Updated name')
    end

    it 'exposes the report on the context' do
      expect(interactor.report).to eq(report)
    end
  end

  context 'when the (mutated) report is invalid' do
    before { report.assign_attributes(name: nil) }

    # NOTE: The production interactor references `client.errors` in its failure
    # branch, but `client` is not defined on this class. As a result, an invalid
    # update raises NameError rather than failing the context cleanly. This spec
    # pins that externally observable behavior so the upgrade work surfaces a
    # change in it.
    it 'raises NameError because the failure branch references an undefined `client`' do
      expect { interactor }.to raise_error(NameError, /client/)
    end

    it 'does not persist the invalid change' do
      expect { interactor rescue nil }.not_to change { report.reload.name }
    end
  end
end
