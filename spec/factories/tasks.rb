FactoryBot.define do
  factory :task do
    sequence(:title) { |n| "タスク #{n}" }
    description { Faker::Lorem.sentence }
    status { :pending }
    priority { :medium }
    due_date { Date.today + 7 }
    category { nil }
    association :created_by, factory: :user
    association :updated_by, factory: :user
  end
end
