class AddUserColumnsToTasks < ActiveRecord::Migration[8.1]
  def change
    add_reference :tasks, :assignee, foreign_key: { to_table: :users }, null: true
    add_column :tasks, :created_user_id, :bigint, null: true
    add_column :tasks, :updated_user_id, :bigint, null: true
    add_foreign_key :tasks, :users, column: :created_user_id
    add_foreign_key :tasks, :users, column: :updated_user_id

    reversible do |dir|
      dir.up do
        # 既存タスクの作成者・更新者に user_id=1 を設定
        execute "UPDATE tasks SET created_user_id = 1, updated_user_id = 1 WHERE created_user_id IS NULL"
        # NOT NULL 制約を適用
        change_column_null :tasks, :created_user_id, false
        change_column_null :tasks, :updated_user_id, false
      end
    end
  end
end
