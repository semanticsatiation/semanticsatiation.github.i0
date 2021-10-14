class AddColumnTypeChangeForDeadLineAndCloseDateToBug < ActiveRecord::Migration[5.2]
  def change
    change_column :bugs, :dead_line, :datetime
    change_column :bugs, :close_date, :datetime
  end
end
