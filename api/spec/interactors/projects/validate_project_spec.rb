# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::ValidateProject, type: :interactor do
  let!(:client) { create(:client) }

  describe 'success path' do
    context 'when building a new project' do
      let(:params) do
        ActionController::Parameters.new(
          project: {
            name: 'Awareness Lift Study',
            description: 'Tracking awareness pre/post launch',
            project_number: 'ALS-001',
            project_type: 'Custom Research',
            domain_id: client.id
          }
        ).require(:project).permit(:name, :description, :project_number, :project_type, :domain_id)
      end

      subject(:result) { described_class.call(params: params) }

      it 'is successful' do
        expect(result).to be_a_success
      end

      it 'exposes a non-persisted project with assigned attributes' do
        expect(result.project).to be_a(Project)
        expect(result.project).not_to be_persisted
        expect(result.project.name).to eq('Awareness Lift Study')
        expect(result.project.domain_id).to eq(client.id)
      end
    end

    context 'when an existing project is supplied' do
      let!(:project) { create(:project, client: client, name: 'Original') }
      let(:params) do
        ActionController::Parameters.new(
          project: { name: 'Refreshed', description: 'updated copy' }
        ).require(:project).permit(:name, :description)
      end

      subject(:result) { described_class.call(params: params, project: project) }

      it 'is successful' do
        expect(result).to be_a_success
      end

      it 'assigns the new attributes without saving' do
        expect(result.project.name).to eq('Refreshed')
        expect(result.project.description).to eq('updated copy')
        expect(project.reload.name).to eq('Original')
      end
    end
  end

  describe 'failure path' do
    context 'when attributes are invalid' do
      let(:params) do
        ActionController::Parameters.new(
          project: { name: '', domain_id: client.id }
        ).require(:project).permit(:name, :domain_id)
      end

      subject(:result) { described_class.call(params: params) }

      it 'is a failure' do
        expect(result).to be_a_failure
      end

      it 'exposes the validation errors as the message' do
        expect(result.message[:name]).to include("can't be blank")
      end
    end
  end
end
