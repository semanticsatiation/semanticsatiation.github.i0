class AddCloseDateToBug < ActiveRecord::Migration[5.2]
  def change
    add_column :bugs, :close_date, :date
  end
end
