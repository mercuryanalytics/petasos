class AddScopeNameAndCorrectGlobalDynamicScopes < ActiveRecord::Migration[6.0]
  def change
    Scope.reset_column_information

    reversible do |dir|
      dir.up do
§        add_column :scopes, :name, :string unless column_exists?(:scopes, :name)

        Scope.create!(name: 'Mercury Analytics Admin', action: 'admin', scope: 'admin', description: 'Global admin', global: true)
        Scope.create!(name: 'Researcher', action: 'research', scope: 'user', description: 'Research project', global: true)
        Scope.create!(name: 'ERP Manager', action: 'erp', scope: 'user', description: 'ERP Admin', global: true)

        Scope.create!(name: 'Financial Manager', action: 'financial_access', scope: 'projects', description: 'Financial access scope', dynamic: true)
        Scope.create!(name: 'Report viewer', action: 'view_report', scope: 'reports', description: 'Report dynamic permission', dynamic: true)
      end

      dir.down do
        Scope.where(global: true).destroy_all
        Scope.where(dynamic: true).destroy_all
      end
    end
  end
end
