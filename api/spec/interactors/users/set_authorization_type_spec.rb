require 'rails_helper'

RSpec.describe Users::SetAuthorizationType do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:report) { create(:report, project: project) }

  subject(:interactor) { described_class.call(authorization_params: authorization_params) }

  context 'with a report_id' do
    let(:authorization_params) do
      ActiveSupport::HashWithIndifferentAccess.new(
        'report_id' => report.id, 'project_id' => project.id, 'client_id' => client.id
      )
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'sets the report on the context' do
      expect(interactor.report).to eq(report)
    end

    it 'does not set the project or client' do
      expect(interactor.project).to be_nil
      expect(interactor.client).to be_nil
    end
  end

  context 'with a project_id but no report_id' do
    let(:authorization_params) do
      ActiveSupport::HashWithIndifferentAccess.new('project_id' => project.id, 'client_id' => client.id)
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'sets the project on the context' do
      expect(interactor.project).to eq(project)
    end
  end

  context 'with only a client_id' do
    let(:authorization_params) do
      ActiveSupport::HashWithIndifferentAccess.new('client_id' => client.id)
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'sets the client on the context' do
      expect(interactor.client).to eq(client)
    end
  end

  context 'when the project_id is missing from the database' do
    let(:authorization_params) do
      ActiveSupport::HashWithIndifferentAccess.new('project_id' => -1)
    end

    it 'raises ActiveRecord::RecordNotFound (primary failure mode)' do
      expect { interactor }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
