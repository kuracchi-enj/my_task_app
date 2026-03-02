FactoryBot.define do
  factory :task do
    sequence(:title) { |n| "タスク #{n}" }
    description { Faker::Lorem.sentence }
    status { :pending }
    priority { :medium }
    due_date { Date.today + 7 }
    category { nil }
  end
end
