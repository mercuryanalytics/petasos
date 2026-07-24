# frozen_string_literal: true

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

    it 'fails the context' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the report validation errors as the failure message' do
      expect(interactor.message).to be_a(ActiveModel::Errors)
    end

    it 'does not persist the invalid change' do
      expect { interactor }.not_to(change { report.reload.name })
    end
  end
end
