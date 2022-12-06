class AddGlobalAndDynamicAttributesToScopes < ActiveRecord::Migration[6.0]
  def change
    add_column :scopes, :global, :boolean, default: false
    add_column :scopes, :dynamic, :boolean, default: false
  end
end
