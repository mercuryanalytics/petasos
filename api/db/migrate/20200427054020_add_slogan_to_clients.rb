class AddSloganToClients < ActiveRecord::Migration[6.0]
  def change
    add_column :clients, :slogan, :text
  end
end
