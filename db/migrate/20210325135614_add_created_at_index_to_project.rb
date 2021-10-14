class AddCreatedAtIndexToProject < ActiveRecord::Migration[5.2]
  def change
    add_index :projects, :created_at
  end
end
