class AddMissingAttributesToClient < ActiveRecord::Migration[6.0]
  def change
    add_column :clients, :company_name, :string
    add_column :clients, :contact_type, :string
    add_column :clients, :contact_name, :string
    add_column :clients, :contact_title, :string
    add_column :clients, :contact_phone, :string
    add_column :clients, :contact_fax, :string
    add_column :clients, :contact_email, :string
    add_column :clients, :mailing_address_1, :string
    add_column :clients, :mailing_address_2, :string
    add_column :clients, :mailing_city, :string
    add_column :clients, :mailing_state, :string
    add_column :clients, :mailing_zip, :string
    add_column :clients, :billing_address_1, :string
    add_column :clients, :billing_address_2, :string
    add_column :clients, :billing_city, :string
    add_column :clients, :billing_state, :string
    add_column :clients, :billing_zip, :string
    add_column :clients, :parent_id, :integer
  end
end
