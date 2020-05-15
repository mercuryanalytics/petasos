class AddNewFieldsToClient < ActiveRecord::Migration[6.0]
  def change
    add_column :clients, :client_text, :text
    add_column :clients, :closing, :string
    add_column :clients, :homepage, :string
  end
end
