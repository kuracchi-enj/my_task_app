class User < ApplicationRecord
  has_secure_password

  belongs_to :group, optional: true

  validates :login_id, presence: true, uniqueness: true
  validates :name, presence: true
end
