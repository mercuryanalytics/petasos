class RemoveClientIdFromUser < ActiveRecord::Migration[6.0]
  def change
    reversible do |dir|
      dir.up do
        remove_column :users, :client_id
      end

      dir.down do
        add_column :users, :client_id, :bigint, foreign_key: true
      end
    end
  end
end
