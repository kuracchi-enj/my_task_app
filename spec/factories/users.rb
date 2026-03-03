FactoryBot.define do
  factory :user do
    sequence(:login_id) { |n| "user#{n}" }
    password { 'password' }
    sequence(:name) { |n| "ユーザー #{n}" }
    group { nil }
  end
end
