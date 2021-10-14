class AddNotNullEndDateToBug < ActiveRecord::Migration[5.2]
  def change
    change_column_null :bugs, :end_date, false
  end
end
