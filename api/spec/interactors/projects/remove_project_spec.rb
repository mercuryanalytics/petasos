# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::RemoveProject, type: :interactor do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }

  describe 'success path' do
    subject(:result) { described_class.call(project: project) }

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'destroys the project' do
      expect { result }.to change(Project, :count).by(-1)
    end

    it 'destroys dependent reports' do
      create(:report, project: project)
      create(:report, project: project)

      expect { described_class.call(project: project) }.to change(Report, :count).by(-2)
    end
  end

  describe 'failure-adjacent behavior' do
    context 'when destroy is blocked by ActiveRecord' do
      before do
        allow(project).to receive(:destroy).and_return(false)
      end

      # The interactor does not call `context.fail!` on a `destroy` that
      # returns false, so the contract is "success regardless of outcome".
      # Capture that behavior so a future refactor that adds a failure
      # check will trip a failing spec.
      it 'still reports success even though the row remains' do
        result = described_class.call(project: project)

        expect(result).to be_a_success
        expect(Project.exists?(project.id)).to be true
      end
    end
  end
end
