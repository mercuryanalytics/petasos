class AddUserInfoToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :company_name,     :string
    add_column :users, :contact_name,     :string
    add_column :users, :contact_title,    :string
    add_column :users, :contact_phone,    :string
    add_column :users, :contact_fax,      :string
    add_column :users, :contact_email,    :string
    add_column :users, :mailing_address_1, :string
    add_column :users, :mailing_address_2, :string
    add_column :users, :mailing_city,     :string
    add_column :users, :mailing_state,    :string
    add_column :users, :mailing_zip,      :string
  end
end
