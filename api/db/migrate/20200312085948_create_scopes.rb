class CreateScopes < ActiveRecord::Migration[6.0]
  def change
    create_table :scopes do |t|
      t.string :scope
      t.string :action
      t.text :description

      t.timestamps
    end

    create_table :scopes_users, id: false do |f|
      f.belongs_to :scope
      f.belongs_to :user
    end
  end
end
