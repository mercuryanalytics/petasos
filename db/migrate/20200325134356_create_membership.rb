class CreateMembership < ActiveRecord::Migration[6.0]
  def change
    create_table :memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true
    end
  end
end
