class AddNullFalseToUser < ActiveRecord::Migration[5.2]
  def change
    change_column_null :users, :session_token, false
    change_column_null :users, :password_digest, false
    change_column_null :users, :username, false
  end
end
