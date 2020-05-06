class AddSubdomainToClient < ActiveRecord::Migration[6.0]
  def change
    add_column :clients, :subdomain, :string
  end
end
