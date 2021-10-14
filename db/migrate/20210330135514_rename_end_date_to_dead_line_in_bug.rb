class RenameEndDateToDeadLineInBug < ActiveRecord::Migration[5.2]
  def change
    rename_column :bugs, :end_date, :dead_line
  end
end
