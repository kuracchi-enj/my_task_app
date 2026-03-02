import React, { useState, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'
import { api } from '../utils/api'
import TaskFilter from './TaskFilter'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import CategoryManager from './CategoryManager'
import type { Task, TaskFormData, FilterParams } from '../types'

const TASKS_API_PATH = '/api/v1/tasks'

const INITIAL_FILTERS: FilterParams = {
  q: '',
  status: '',
  category_id: '',
  priority: '',
}

const TaskApp: React.FC = () => {
  const [filters, setFilters] = useState<FilterParams>(INITIAL_FILTERS)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)

  const { tasks, loading, error, fetchTasks } = useTasks()
  const { categories, fetchCategories } = useCategories()

  const handleFilterChange = useCallback(
    (newFilters: FilterParams) => {
      setFilters(newFilters)
      fetchTasks(newFilters)
    },
    [fetchTasks]
  )

  const handleOpenCreate = () => {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const handleSubmitTask = async (formData: TaskFormData) => {
    const body = { task: formData }

    const response = editingTask
      ? await api.patch(`${TASKS_API_PATH}/${editingTask.id}`, body)
      : await api.post(TASKS_API_PATH, body)

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.errors?.join(', ') ?? '保存に失敗しました')
    }

    // フォーム送信後にフィルターを維持したままリスト更新
    await fetchTasks(filters)
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('このタスクを削除しますか？')) return

    const response = await api.delete(`${TASKS_API_PATH}/${taskId}`)
    if (response.ok) {
      await fetchTasks(filters)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">🗂️ タスク管理</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCategoryManager((prev) => !prev)}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              カテゴリ
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              ＋ 新規タスク
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* メインコンテンツ */}
          <div className="flex-1">
            <TaskFilter
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{tasks.length} 件</p>
            </div>
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTask}
            />
          </div>

          {/* カテゴリ管理サイドパネル */}
          {showCategoryManager && (
            <div className="w-full lg:w-64 shrink-0">
              <CategoryManager
                categories={categories}
                onCategoriesChange={fetchCategories}
              />
            </div>
          )}
        </div>
      </main>

      {/* タスクフォームモーダル */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          categories={categories}
          onSubmit={handleSubmitTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

export default TaskApp
