class AddStepsPlatformUrlComponentsPriorityToBugs < ActiveRecord::Migration[5.2]
  def change
    add_column :bugs, :steps, :string, null: false
    add_column :bugs, :platform, :string, null: false
    add_column :bugs, :url, :string, null: false
    add_column :bugs, :components, :string, null: false
    add_column :bugs, :priority, :string, null: false
  end
end
