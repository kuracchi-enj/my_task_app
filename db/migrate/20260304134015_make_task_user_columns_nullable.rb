class MakeTaskUserColumnsNullable < ActiveRecord::Migration[8.1]
  def change
    change_column_null :tasks, :created_user_id, true
    change_column_null :tasks, :updated_user_id, true
  end
end
