class AddSetOfGlobalAndDynamicScopes < ActiveRecord::Migration[6.0]
  def change
    Scope.reset_column_information

    reversible do |dir|
      dir.up do
        Scope.create!(action: 'admin', scope: 'admin', description: 'Global admin', global: true)
        Scope.create!(action: 'user', scope: 'research', description: 'Research project', global: true)
        Scope.create!(action: 'user', scope: 'erp', description: 'ERP Admin', global: true)

        Scope.create!(action: 'projects', scope: 'financial_access', description: 'Financial access scope', dynamic: true)
        Scope.create!(action: 'reports', scope: 'view_report', description: 'Report dynamic permission', dynamic: true)
      end

      dir.down do
        Scope.where(global: true).destroy_all
        Scope.where(dynamic: true).destroy_all
      end
    end
  end
end
