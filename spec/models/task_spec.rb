require 'rails_helper'

RSpec.describe Task, type: :model do
  describe 'バリデーション' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_most(255) }
  end

  describe 'アソシエーション' do
    it { is_expected.to belong_to(:category).optional }
  end

  describe 'enum' do
    it { is_expected.to define_enum_for(:status).with_values(pending: 0, responding: 1, finish: 2) }
    it { is_expected.to define_enum_for(:priority).with_values(low: 0, medium: 1, high: 2) }
  end

  describe 'スコープ' do
    let!(:matching_task) { create(:task, title: '重要なタスク') }
    let!(:other_task) { create(:task, title: '別のタスク') }

    describe '.search_by_title' do
      it '部分一致でタスクを検索できる' do
        expect(described_class.search_by_title('重要')).to include(matching_task)
        expect(described_class.search_by_title('重要')).not_to include(other_task)
      end

      it '空文字の場合は全件返す' do
        expect(described_class.search_by_title('')).to include(matching_task, other_task)
      end
    end

    describe '.filter_by_status' do
      let!(:responding_task) { create(:task, status: :responding) }

      it '指定ステータスのタスクを返す' do
        expect(described_class.filter_by_status('pending')).to include(matching_task, other_task)
        expect(described_class.filter_by_status('pending')).not_to include(responding_task)
      end
    end

    describe '.filter_by_priority' do
      let!(:high_task) { create(:task, priority: :high) }

      it '指定優先度のタスクを返す' do
        expect(described_class.filter_by_priority('high')).to include(high_task)
        expect(described_class.filter_by_priority('high')).not_to include(matching_task)
      end
    end
  end
end
