import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import type { Category } from '../types'

const CATEGORIES_API_PATH = '/api/v1/categories'

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get(CATEGORIES_API_PATH)
      if (!response.ok) throw new Error('カテゴリの取得に失敗しました')
      const data: Category[] = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { categories, loading, error, fetchCategories }
}
