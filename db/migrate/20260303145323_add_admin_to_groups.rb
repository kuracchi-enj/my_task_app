class AddAdminToGroups < ActiveRecord::Migration[8.1]
  def change
    add_column :groups, :admin, :boolean, null: false, default: false
    # ID=1 の開発部を admin: true に設定
    reversible do |dir|
      dir.up { execute "UPDATE groups SET admin = TRUE WHERE id = 1" }
    end
  end
end
