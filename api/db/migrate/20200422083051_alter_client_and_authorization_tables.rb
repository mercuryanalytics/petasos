class AlterClientAndAuthorizationTables < ActiveRecord::Migration[6.0]
  def change
    reversible do |dir|
      dir.up do
        add_column :clients, :default_template_enabled, :boolean, default: false
        add_column :authorizations,
                   :client_id,
                   :bigint,
                   foreign_key: true, index: true, null: true
      end

      dir.down do
        remove_column :clients, :default_template_enabled
        remove_column :authorizations, :client_id
      end
    end
  end
end
