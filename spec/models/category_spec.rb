require 'rails_helper'

RSpec.describe Category, type: :model do
  subject { build(:category) }

  describe 'バリデーション' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
  end

  describe 'アソシエーション' do
    it { is_expected.to have_many(:tasks).dependent(:nullify) }
  end
end
