class AddMembershipIdToAuthorization < ActiveRecord::Migration[6.0]
  def change
    change_column :authorizations, :user_id, :integer, null: true
    add_reference :authorizations, :membership, foreign_key: true
  end
end
