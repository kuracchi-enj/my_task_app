require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーション' do
    it { is_expected.to validate_presence_of(:login_id) }
    it { is_expected.to validate_uniqueness_of(:login_id) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to have_secure_password }
  end

  describe 'アソシエーション' do
    it { is_expected.to belong_to(:group).optional }
  end
end
