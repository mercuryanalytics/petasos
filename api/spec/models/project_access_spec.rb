require 'rails_helper'

RSpec.describe ProjectAccess, type: :model do
  it { should belong_to :project }

  describe 'project association' do
    let(:client) { create(:client) }
    let(:project) { create(:project, client: client) }

    it 'is valid with a project' do
      project_access = build(:project_access, project_id: project.id, account_id: 'user-1')
      expect(project_access).to be_valid
    end

    it 'is invalid without a project' do
      project_access = build(:project_access, project_id: nil, account_id: 'user-1')
      expect(project_access).not_to be_valid
    end

    it 'returns the associated project' do
      project_access = create(:project_access, project_id: project.id, account_id: 'user-1')
      expect(project_access.project).to eq(project)
    end
  end
end
