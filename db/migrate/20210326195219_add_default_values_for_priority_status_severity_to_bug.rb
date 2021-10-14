class AddDefaultValuesForPriorityStatusSeverityToBug < ActiveRecord::Migration[5.2]
  def change
    change_column :bugs, :status, :string, default: "new"
    change_column :bugs, :severity, :string, default: "minor"
    change_column :bugs, :priority, :string, default: "low"
  end
end
