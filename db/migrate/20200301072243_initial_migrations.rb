class InitialMigrations < ActiveRecord::Migration[6.0]
  def change
    create_table :projects do |t|
      t.string :name
      t.text :description
      t.string :project_number
      t.integer :domain_id
      t.string :project_type
      t.string :account_id
      t.date :modified_on

      t.timestamps
    end

    create_table :project_accesses do |t|
      t.string :account_id
      t.integer :project_id
    end

    create_table :reports do |t|
      t.string :name
      t.string :url
      t.text :description
      t.integer :project_id
      t.date :presented_on
      t.date :modified_on

      t.timestamps
    end

    create_table :report_accesses do |t|
      t.string :account_id
      t.integer :report_id
    end
  end
end
