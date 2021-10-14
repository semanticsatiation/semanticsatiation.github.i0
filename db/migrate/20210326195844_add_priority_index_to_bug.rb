class AddPriorityIndexToBug < ActiveRecord::Migration[5.2]
  def change
    add_index :bugs, :priority 
  end
end
