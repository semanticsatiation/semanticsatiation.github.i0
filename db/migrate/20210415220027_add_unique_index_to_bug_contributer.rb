class AddUniqueIndexToBugContributer < ActiveRecord::Migration[5.2]
  def change
    add_index :bug_contributers, [:bug_id, :user_id], unique: true
  end
end
