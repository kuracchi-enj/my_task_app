class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      # status: 0=pending, 1=responding, 2=finish
      t.integer :status, null: false, default: 0
      # priority: 0=low, 1=medium, 2=high
      t.integer :priority, null: false, default: 1
      t.date :due_date
      t.references :category, null: true, foreign_key: true

      t.timestamps
    end
  end
end
