# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::UpdateProject, type: :interactor do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client, name: 'Original Name') }

  describe 'success path' do
    before { project.name = 'Updated Name' }

    subject(:result) { described_class.call(project: project) }

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'persists the changes' do
      result
      expect(project.reload.name).to eq('Updated Name')
    end

    it 'exposes the updated project on the context' do
      expect(result.project.name).to eq('Updated Name')
    end
  end

  describe 'failure path' do
    context 'when the project is invalid' do
      before { project.name = nil }

      subject(:result) { described_class.call(project: project) }

      it 'is a failure' do
        expect(result).to be_a_failure
      end

      it 'exposes the validation errors as the message' do
        expect(result.message[:name]).to include("can't be blank")
      end

      it 'does not persist the change' do
        result
        expect(project.reload.name).to eq('Original Name')
      end
    end
  end
end
