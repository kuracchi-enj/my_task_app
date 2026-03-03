import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import type { Task, FilterParams } from '../types'

const TASKS_API_PATH = '/api/v1/tasks'

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (filters: Partial<FilterParams> = {}) => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.status) params.set('status', filters.status)
    if (filters.category_id) params.set('category_id', String(filters.category_id))
    if (filters.priority) params.set('priority', filters.priority)
    // 'all' の場合はパラメーターを送らず全件取得、数値の場合は特定担当者でフィルター
    if (filters.assignee_id !== undefined && filters.assignee_id !== 'all') {
      params.set('assignee_id', String(filters.assignee_id))
    }

    const path = params.toString() ? `${TASKS_API_PATH}?${params}` : TASKS_API_PATH

    try {
      const response = await api.get(path)
      if (!response.ok) throw new Error('タスクの取得に失敗しました')
      const data: Task[] = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, error, fetchTasks }
}
