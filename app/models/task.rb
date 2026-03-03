class Task < ApplicationRecord
  belongs_to :category, optional: true
  belongs_to :assignee, class_name: "User", foreign_key: :assignee_id, optional: true
  belongs_to :created_by, class_name: "User", foreign_key: :created_user_id, optional: true
  belongs_to :updated_by, class_name: "User", foreign_key: :updated_user_id, optional: true

  enum :status, { pending: 0, responding: 1, finish: 2 }
  enum :priority, { low: 0, medium: 1, high: 2 }

  validates :title, presence: true, length: { maximum: 255 }

  scope :search_by_title, ->(query) { where("title ILIKE ?", "%#{query}%") if query.present? }
  scope :filter_by_status, ->(status) { where(status: status) if status.present? }
  scope :filter_by_category, ->(category_id) { where(category_id: category_id) if category_id.present? }
  scope :filter_by_priority, ->(priority) { where(priority: priority) if priority.present? }
  scope :filter_by_assignee, ->(user_id) { where(assignee_id: user_id) if user_id.present? }
end
