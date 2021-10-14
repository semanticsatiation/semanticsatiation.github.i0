class CreateActivities < ActiveRecord::Migration[5.2]
  def change
    create_table :activities do |t|
      t.references :activitable, polymorphic: true
      t.string :activity, null: false

      t.timestamps
    end
  end
end
