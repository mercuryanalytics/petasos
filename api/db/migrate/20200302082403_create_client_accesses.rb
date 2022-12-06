class CreateClientAccesses < ActiveRecord::Migration[6.0]
  def change
    create_table :client_accesses do |t|
      t.references :client, null: false, foreign_key: true
      t.string :account_id

      t.timestamps
    end
  end
end
