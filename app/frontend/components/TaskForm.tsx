import React, { useState, useEffect } from 'react'
import Select, { type StylesConfig, type SingleValue } from 'react-select'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ja } from 'date-fns/locale'
import { format, parseISO } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import type { Task, TaskFormData, Category } from '../types'

registerLocale('ja', ja)

const INITIAL_FORM_DATA: TaskFormData = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: '',
  category_id: '',
}

type SelectOption = { value: string | number; label: string }

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: '未着手' },
  { value: 'responding', label: '対応中' },
  { value: 'finish', label: '完了' },
]

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base) => ({
    ...base,
    minHeight: '38px',
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
}

interface TaskFormProps {
  task: Task | null
  categories: Category[]
  onSubmit: (data: TaskFormData) => Promise<void>
  onClose: () => void
}

const TaskForm: React.FC<TaskFormProps> = ({ task, categories, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_DATA)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'なし' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  // 編集時は既存データをフォームにセット
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ?? '',
        category_id: task.category?.id ?? '',
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }
  }, [task])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (key: keyof TaskFormData) => (option: SingleValue<SelectOption>) => {
    const raw = option?.value ?? ''
    const value = key === 'category_id' && raw !== '' ? Number(raw) : raw
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      due_date: date ? format(date, 'yyyy-MM-dd') : '',
    }))
  }

  const dueDateValue = formData.due_date ? parseISO(formData.due_date) : null

  const findOption = (options: SelectOption[], value: string | number | '') =>
    options.find((opt) => opt.value === value) ?? null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors([])

    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setErrors(err instanceof Error ? [err.message] : ['送信に失敗しました'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // モーダルオーバーレイ
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'タスクを編集' : 'タスクを作成'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {/* エラー表示 */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              {errors.map((err, i) => (
                <p key={i} className="text-red-700 text-sm">{err}</p>
              ))}
            </div>
          )}

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <Select
                options={STATUS_OPTIONS}
                value={findOption(STATUS_OPTIONS, formData.status)}
                onChange={handleSelectChange('status')}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            {/* 優先度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
              <Select
                options={PRIORITY_OPTIONS}
                value={findOption(PRIORITY_OPTIONS, formData.priority)}
                onChange={handleSelectChange('priority')}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <Select
                options={categoryOptions}
                value={findOption(categoryOptions, formData.category_id)}
                onChange={handleSelectChange('category_id')}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            {/* 期限日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">期限日</label>
              <DatePicker
                selected={dueDateValue}
                onChange={handleDateChange}
                locale="ja"
                dateFormat="yyyy/MM/dd"
                placeholderText="日付を選択"
                isClearable
                autoComplete="off"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '送信中...' : task ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm

