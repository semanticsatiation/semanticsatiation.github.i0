class AddUniqueScopeToProjectContributors < ActiveRecord::Migration[5.2]
  def change
    add_index :project_contributers, [:project_id, :user_id], unique: true
  end
end
