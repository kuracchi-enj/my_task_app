require 'rails_helper'

RSpec.describe Group, type: :model do
  subject { build(:group) }

  describe 'バリデーション' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).ignoring_case_sensitivity }
  end

  describe 'アソシエーション' do
    it { is_expected.to have_many(:users).dependent(:nullify) }
  end
end
