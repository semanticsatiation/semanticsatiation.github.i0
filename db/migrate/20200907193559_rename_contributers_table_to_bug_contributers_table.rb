class RenameContributersTableToBugContributersTable < ActiveRecord::Migration[5.2]
  def change
    rename_table :contributers, :bug_contributers
  end 
end
