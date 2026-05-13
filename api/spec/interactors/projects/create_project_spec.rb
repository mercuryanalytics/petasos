# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::CreateProject, type: :interactor do
  let!(:client) { create(:client) }

  describe 'success path' do
    let(:project) do
      Project.new(
        name: 'Brand Awareness Tracker',
        description: 'Quarterly brand health study',
        project_number: 'BAT-2026',
        project_type: 'Custom Research',
        client: client
      )
    end

    subject(:result) { described_class.call(project: project) }

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'persists the project' do
      expect { result }.to change(Project, :count).by(1)
    end

    it 'exposes the persisted project on the context' do
      expect(result.project).to be_persisted
      expect(result.project.name).to eq('Brand Awareness Tracker')
    end
  end

  describe 'failure path' do
    context 'when the project cannot be saved' do
      let(:project) { Project.new(client: client) }

      subject(:result) { described_class.call(project: project) }

      it 'is a failure' do
        expect(result).to be_a_failure
      end

      it 'exposes the validation errors as the message' do
        expect(result.message[:name]).to include("can't be blank")
      end

      it 'does not persist the project' do
        expect { result }.not_to change(Project, :count)
      end
    end
  end
end
