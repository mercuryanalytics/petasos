class AddMailingCountryToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :mailing_country, :string
  end
end
