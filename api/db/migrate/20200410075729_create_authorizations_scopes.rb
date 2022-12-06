class CreateAuthorizationsScopes < ActiveRecord::Migration[6.0]
  def change
    reversible do |dir|
      dir.up do
        create_table :authorizations_scopes do |t|
          t.references :authorization, foreign_key: true, null: false, index: true
          t.references :scope, foreign_key: true, null: false, index: true
        end
      end

      dir.down do
        drop_table :authorizations_scopes
      end
    end
  end
end
