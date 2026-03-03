require 'rails_helper'

RSpec.describe Group, type: :model do
  describe 'バリデーション' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
  end

  describe 'アソシエーション' do
    it { is_expected.to have_many(:users).dependent(:nullify) }
  end
end
