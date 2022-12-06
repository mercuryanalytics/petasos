class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :email
      t.string :auth_id
      t.references :client, foreign_key: true

      t.timestamps
    end
  end
end
