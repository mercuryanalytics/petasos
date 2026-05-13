require 'rails_helper'

RSpec.describe Ability, type: :model do
  describe '.new' do
    it 'initializes without error for a user' do
      user = create(:user)
      expect { described_class.new(user) }.not_to raise_error
    end

    it 'initializes without error when the user is nil' do
      expect { described_class.new(nil) }.not_to raise_error
    end

    it 'includes CanCan::Ability' do
      expect(described_class.ancestors).to include(CanCan::Ability)
    end
  end

  describe '#parse_scopes' do
    let(:ability) { described_class.new(nil) }

    it 'groups permissions by model' do
      permissions = ['read:projects', 'update:projects', 'read:reports']

      expect(ability.parse_scopes(permissions)).to eq(
        'projects' => %w[read update],
        'reports' => %w[read]
      )
    end

    it 'returns an empty hash when given no permissions' do
      expect(ability.parse_scopes([])).to eq({})
    end

    it 'preserves a single permission for a single model' do
      expect(ability.parse_scopes(['read:clients'])).to eq('clients' => %w[read])
    end
  end

  describe '#resource_ids' do
    let(:ability) { described_class.new(nil) }
    let(:user) { create(:user) }
    let(:client) { create(:client) }
    let(:project) { create(:project, client: client) }
    let(:other_project) { create(:project, client: client) }

    it 'returns the ids of accessible resources for the given user' do
      create(:project_access, project_id: project.id, account_id: user.id.to_s)
      create(:project_access, project_id: other_project.id, account_id: 'someone-else')

      expect(ability.resource_ids('projects', user)).to contain_exactly(project.id)
    end

    it 'returns an empty array when the user has no accesses for the model' do
      expect(ability.resource_ids('projects', user)).to eq([])
    end
  end
end
