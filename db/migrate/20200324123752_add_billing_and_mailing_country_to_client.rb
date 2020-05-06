class AddBillingAndMailingCountryToClient < ActiveRecord::Migration[6.0]
  def change
    add_column :clients, :mailing_country, :string
    add_column :clients, :billing_country, :string
  end
end
