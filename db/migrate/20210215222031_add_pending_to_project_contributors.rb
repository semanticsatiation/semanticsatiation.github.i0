class AddPendingToProjectContributors < ActiveRecord::Migration[5.2]
  def change
    add_column :project_contributers, :pending, :boolean, :default => true
  end
end
