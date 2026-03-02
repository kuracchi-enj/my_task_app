import React, { useState } from 'react'
import { api } from '../utils/api'
import type { Category } from '../types'

const CATEGORIES_API_PATH = '/api/v1/categories'

interface CategoryManagerProps {
  categories: Category[]
  onCategoriesChange: () => void
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onCategoriesChange }) => {
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await api.post(CATEGORIES_API_PATH, { category: { name: newName.trim() } })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.errors?.join(', ') ?? 'カテゴリの作成に失敗しました')
      }
      setNewName('')
      onCategoriesChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: number) => {
    if (!confirm('このカテゴリを削除しますか？')) return

    try {
      const response = await api.delete(`${CATEGORIES_API_PATH}/${categoryId}`)
      if (!response.ok) throw new Error('カテゴリの削除に失敗しました')
      onCategoriesChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">カテゴリ管理</h2>

      {error && (
        <p className="text-red-600 text-xs mb-2">{error}</p>
      )}

      {/* カテゴリ追加フォーム */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="カテゴリ名"
          className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={submitting || !newName.trim()}
          className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          追加
        </button>
      </form>

      {/* カテゴリ一覧 */}
      <ul className="flex flex-col gap-1">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{cat.name}</span>
            <button
              onClick={() => handleDelete(cat.id)}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CategoryManager
