class AddResearchScope < ActiveRecord::Migration[6.0]
  def change
    Scope.find_or_create_by(action: 'research', scope: 'project')
  end
end
