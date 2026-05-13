# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::UpdateProjectOrganizer, type: :interactor do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client, name: 'Original Name') }

  describe 'success path' do
    let(:params) do
      ActionController::Parameters.new(
        project: { name: 'Renamed Project', description: 'Refreshed copy' }
      ).require(:project).permit(:name, :description)
    end

    subject(:result) { described_class.call(params: params, project: project) }

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'persists the updated attributes' do
      result
      expect(project.reload.name).to eq('Renamed Project')
      expect(project.reload.description).to eq('Refreshed copy')
    end

    it 'exposes the updated project on the context' do
      expect(result.project.name).to eq('Renamed Project')
    end
  end

  describe 'failure path' do
    context 'when validation fails' do
      let(:params) do
        ActionController::Parameters.new(
          project: { name: '' }
        ).require(:project).permit(:name)
      end

      subject(:result) { described_class.call(params: params, project: project) }

      it 'is a failure' do
        expect(result).to be_a_failure
      end

      it 'exposes the validation errors as the message' do
        expect(result.message[:name]).to include("can't be blank")
      end

      it 'does not persist any change' do
        result
        expect(project.reload.name).to eq('Original Name')
      end
    end
  end
end
