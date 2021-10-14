class CreateNotifications < ActiveRecord::Migration[5.2]
  def change
    create_table :notifications do |t|
      t.integer :recipient_id, null: false
      t.integer :actor_id, null: false
      t.boolean :read, default: false
      t.text :context, null: false, default: ""
      t.string :link
      t.string :action

      t.timestamps
    end
  end
end
