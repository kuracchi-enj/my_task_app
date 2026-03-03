# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

CATEGORY_NAMES = [ '一般', '開発', 'お金', 'その他' ].freeze

# 旧カテゴリ名（英語）を削除して日本語名に統一
Category.where.not(name: CATEGORY_NAMES).destroy_all

CATEGORY_NAMES.each do |name|
  Category.find_or_create_by!(name: name)
end

# グループの初期データ
development_group = Group.find_or_create_by!(name: '開発部')

# 管理者ユーザーの初期データ
User.find_or_initialize_by(login_id: 'admin').tap do |user|
  user.name = 'システム管理者'
  user.group = development_group
  user.password = 'password1' if user.new_record?
  user.save!
end
