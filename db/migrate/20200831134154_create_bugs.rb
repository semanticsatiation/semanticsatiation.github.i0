class CreateBugs < ActiveRecord::Migration[5.2]
  def change
    create_table :bugs do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.string :type, null: false
      t.string :status, null: false
      t.string :severity, null: false
      t.string :expected_result, null: false
      t.string :actual_result, null: false
      t.string :environment, null: false
      t.string :testing_version, null: false
      t.string :reproducibility_rate
      t.date :start_date
      t.date :end_date
      t.references :project, foreign_key: true
      t.references :user, foreign_key: true
      t.timestamps
    end

    add_index :bugs, :title
    add_index :bugs, :severity
    add_index :bugs, :status
    add_index :bugs, :type
  end
end
