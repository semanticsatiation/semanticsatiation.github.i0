class AddCreatedAtPendingIndicesToProjectContributer < ActiveRecord::Migration[5.2]
  def change
    add_index :project_contributers, :created_at
    add_index :project_contributers, :pending
  end
end
