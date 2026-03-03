class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :login_id, null: false
      t.string :password_digest, null: false
      t.string :name, null: false
      t.references :group, null: true, foreign_key: true

      t.timestamps
    end

    add_index :users, :login_id, unique: true
  end
end
