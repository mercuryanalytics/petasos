class AlterMembershipIdOnAuthorization < ActiveRecord::Migration[6.0]
  def change
    reversible do |dir|
      dir.up do
        change_column :authorizations, :membership_id, :bigint, null: true, foreign_key: true
      end

      dir.down do
        change_column :authorizations, :membership_id, :bigint, null: false, foreign_key: true
      end
    end
  end
end
