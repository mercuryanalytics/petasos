class AddAccessScopes < ActiveRecord::Migration[6.0]
  def change
    reversible do |dir|
      dir.up do
        Scope.create!(
          name: 'Client access',
          action: 'access',
          scope: 'client',
          description: 'Gives the user full read access to projects / reports'
        )
        Scope.create!(
          name: 'Project access',
          action: 'access',
          scope: 'project',
          description: 'Gives the user full read access to reports under the project'
        )
      end

      dir.down do
        Scope.where(action: 'access', scope: %w[project client]).destroy_all
      end
    end
  end
end
