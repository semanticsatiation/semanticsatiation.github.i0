class CreateComments < ActiveRecord::Migration[5.2]
  def change
    create_table :comments do |t|
      t.text :comment, null: false
      t.references :bug, foreign_key: true
      t.references :user, foreign_key: true
      t.bigint :parent_id, foreign_key: true
      t.bigint :reply_comment_id, foreign_key: true

      t.timestamps
    end
  end
end
