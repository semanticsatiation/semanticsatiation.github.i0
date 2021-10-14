class AddContributedToProjectContributer < ActiveRecord::Migration[5.2]
  def change
    add_column :project_contributers, :contributed, :boolean, :default => false
  end
end
