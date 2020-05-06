class CreateAuthorizations < ActiveRecord::Migration[6.0]
  def change
    create_table :authorizations do |t|
      t.belongs_to :user
      t.string :subject_class
      t.integer :subject_id

      t.timestamps
    end
  end
end
