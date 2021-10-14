class AddForeignKeyToNotifications < ActiveRecord::Migration[5.2]
  def change
    add_reference :notifications, :project_contributer, foreign_key: true
  end
end
