class RemoveStartDateReproducibilityRateFromBugs < ActiveRecord::Migration[5.2]
  def change
    remove_column :bugs, :start_date, :string
    remove_column :bugs, :reproducibility_rate, :string
  end
end
