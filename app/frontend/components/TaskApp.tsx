import React, { useState, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'
import { useCurrentUser } from '../hooks/useCurrentUser'
import useUsers from '../hooks/useUsers'
import { api } from '../utils/api'
import TaskFilter from './TaskFilter'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import CategoryManager from './CategoryManager'
import GroupManager from './GroupManager'
import type { Task, TaskFormData, FilterParams } from '../types'

const TASKS_API_PATH = '/api/v1/tasks'
const LOGOUT_PATH = '/logout'

const TaskApp: React.FC = () => {
  const { currentUser } = useCurrentUser()
  const { users } = useUsers()

  const initialFilters = (): FilterParams => ({
    q: '',
    status: '',
    category_id: '',
    priority: '',
    assignee_id: currentUser?.id ?? 'all',
  })

  const [filters, setFilters] = useState<FilterParams>(() => ({
    q: '',
    status: '',
    category_id: '',
    priority: '',
    assignee_id: 'all',
  }))
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showGroupManager, setShowGroupManager] = useState(false)

  const { tasks, loading, error, fetchTasks } = useTasks()
  const { categories, fetchCategories } = useCategories()

  // currentUser がロードされたらデフォルトフィルターを設定
  React.useEffect(() => {
    if (currentUser) {
      const defaultFilters: FilterParams = {
        q: '',
        status: '',
        category_id: '',
        priority: '',
        assignee_id: currentUser.id,
      }
      setFilters(defaultFilters)
      fetchTasks(defaultFilters)
    }
  }, [currentUser?.id])

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

    await fetchTasks(filters)
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('このタスクを削除しますか？')) return

    const response = await api.delete(`${TASKS_API_PATH}/${taskId}`)
    if (response.ok) {
      await fetchTasks(filters)
    }
  }

  const handleLogout = async () => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = LOGOUT_PATH

    const methodInput = document.createElement('input')
    methodInput.type = 'hidden'
    methodInput.name = '_method'
    methodInput.value = 'DELETE'
    form.appendChild(methodInput)

    const csrfInput = document.createElement('input')
    csrfInput.type = 'hidden'
    csrfInput.name = 'authenticity_token'
    csrfInput.value =
      document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
    form.appendChild(csrfInput)

    document.body.appendChild(form)
    form.submit()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">タスク管理</h1>
          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="text-sm text-gray-600">
                {currentUser.group_name && (
                  <span className="mr-1 text-gray-400">{currentUser.group_name}</span>
                )}
                {currentUser.name}
              </span>
            )}
            {currentUser?.is_admin && (
              <button
                onClick={() => {
                  setShowGroupManager((prev) => !prev)
                  setShowCategoryManager(false)
                }}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                グループ管理
              </button>
            )}
            <button
              onClick={() => {
                setShowCategoryManager((prev) => !prev)
                setShowGroupManager(false)
              }}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              カテゴリ
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              新規タスク
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* メインコンテンツ */}
          <div className="flex-1">
            {currentUser && (
              <TaskFilter
                categories={categories}
                users={users}
                currentUser={currentUser}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            )}
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

          {/* サイドパネル */}
          {showCategoryManager && (
            <div className="w-full lg:w-64 shrink-0">
              <CategoryManager
                categories={categories}
                onCategoriesChange={fetchCategories}
              />
            </div>
          )}
          {showGroupManager && currentUser?.is_admin && (
            <div className="w-full lg:w-64 shrink-0">
              <GroupManager />
            </div>
          )}
        </div>
      </main>

      {/* タスクフォームモーダル */}
      {isFormOpen && currentUser && (
        <TaskForm
          task={editingTask}
          categories={categories}
          users={users}
          currentUser={currentUser}
          onSubmit={handleSubmitTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

export default TaskApp
