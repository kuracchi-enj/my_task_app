import React, { useState } from 'react'
import Select, { type StylesConfig, type SingleValue } from 'react-select'
import type { FilterParams, Category, CurrentUser, User } from '../types'

type SelectOption = { value: string | number; label: string }

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'すべてのステータス' },
  { value: 'pending', label: '未着手' },
  { value: 'responding', label: '対応中' },
  { value: 'finish', label: '完了' },
]

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: '', label: 'すべての優先度' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base) => ({
    ...base,
    minHeight: '36px',
    fontSize: '14px',
    borderColor: '#d1d5db',
    boxShadow: 'none',
    '&:hover': { borderColor: '#3b82f6' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#374151',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
  valueContainer: (base) => ({ ...base, padding: '0 8px' }),
}

interface TaskFilterProps {
  categories: Category[]
  users: User[]
  currentUser: CurrentUser
  filters: FilterParams
  onFilterChange: (filters: FilterParams) => void
}

const TaskFilter: React.FC<TaskFilterProps> = ({ categories, users, currentUser, filters, onFilterChange }) => {
  const [inputValue, setInputValue] = useState(filters.q)

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'すべてのカテゴリ' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  const assigneeOptions: SelectOption[] = [
    { value: 'all', label: 'すべてのユーザー' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ ...filters, q: inputValue })
  }

  const handleSelectChange = (key: keyof FilterParams) => (option: SingleValue<SelectOption>) => {
    const raw = option?.value ?? ''
    let value: FilterParams[typeof key]
    if (key === 'category_id') {
      value = raw !== '' ? Number(raw) : ''
    } else if (key === 'assignee_id') {
      value = raw === 'all' ? 'all' : Number(raw)
    } else {
      value = raw as FilterParams[typeof key]
    }
    onFilterChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    setInputValue('')
    onFilterChange({ q: '', status: '', category_id: '', priority: '', assignee_id: currentUser.id })
  }

  const findOption = (options: SelectOption[], value: string | number | '') =>
    options.find((opt) => opt.value === value) ?? options[0]

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
        {/* 検索行: 常に横並び */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="タスクを検索..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            検索
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            リセット
          </button>
        </div>

        {/* フィルター行 */}
        <div className="flex flex-wrap gap-3">
          <div className="w-44">
            <Select
              options={STATUS_OPTIONS}
              value={findOption(STATUS_OPTIONS, filters.status)}
              onChange={handleSelectChange('status')}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>
          <div className="w-36">
            <Select
              options={PRIORITY_OPTIONS}
              value={findOption(PRIORITY_OPTIONS, filters.priority)}
              onChange={handleSelectChange('priority')}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>
          <div className="w-48">
            <Select
              options={categoryOptions}
              value={findOption(categoryOptions, filters.category_id)}
              onChange={handleSelectChange('category_id')}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>
          <div className="w-48">
            <Select
              options={assigneeOptions}
              value={findOption(assigneeOptions, filters.assignee_id)}
              onChange={handleSelectChange('assignee_id')}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default TaskFilter
