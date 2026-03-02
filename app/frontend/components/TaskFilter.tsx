import React, { useState } from 'react'
import type { FilterParams, Category, Priority, Status } from '../types'

const STATUS_OPTIONS: { value: Status | ''; label: string }[] = [
  { value: '', label: 'すべてのステータス' },
  { value: 'pending', label: '未着手' },
  { value: 'responding', label: '対応中' },
  { value: 'finish', label: '完了' },
]

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: 'すべての優先度' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

interface TaskFilterProps {
  categories: Category[]
  filters: FilterParams
  onFilterChange: (filters: FilterParams) => void
}

const TaskFilter: React.FC<TaskFilterProps> = ({ categories, filters, onFilterChange }) => {
  const [inputValue, setInputValue] = useState(filters.q)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ ...filters, q: inputValue })
  }

  const handleSelectChange = (key: keyof FilterParams) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value
    onFilterChange({
      ...filters,
      [key]: key === 'category_id' && value !== '' ? Number(value) : value,
    })
  }

  const handleReset = () => {
    setInputValue('')
    onFilterChange({ q: '', status: '', category_id: '', priority: '' })
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* タイトル検索 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル検索
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="タスクを検索..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              検索
            </button>
          </div>
        </div>

        {/* ステータスフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <select
            value={filters.status}
            onChange={handleSelectChange('status')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* カテゴリフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <select
            value={filters.category_id}
            onChange={handleSelectChange('category_id')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 優先度フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
          <select
            value={filters.priority}
            onChange={handleSelectChange('priority')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* リセットボタン */}
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
        >
          リセット
        </button>
      </form>
    </div>
  )
}

export default TaskFilter
