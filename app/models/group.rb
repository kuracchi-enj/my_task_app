class Group < ApplicationRecord
  has_many :users, dependent: :nullify

  validates :name, presence: true, uniqueness: true

  scope :admin_groups, -> { where(admin: true) }
end
