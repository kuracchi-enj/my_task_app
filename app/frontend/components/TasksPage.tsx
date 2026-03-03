import React, { useState, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useCategories } from '../hooks/useCategories'
import useUsers from '../hooks/useUsers'
import { api } from '../utils/api'
import TaskFilter from './TaskFilter'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import type { Task, TaskFormData, FilterParams, CurrentUser } from '../types'

const TASKS_API_PATH = '/api/v1/tasks'

interface TasksPageProps {
  currentUser: CurrentUser
}

const TasksPage: React.FC<TasksPageProps> = ({ currentUser }) => {
  const { users } = useUsers()
  const { categories } = useCategories()
  const [filters, setFilters] = useState<FilterParams>({
    q: '',
    status: '',
    category_id: '',
    priority: '',
    assignee_id: currentUser.id,
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { tasks, loading, error, fetchTasks } = useTasks(filters)

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

  return (
    <div className="flex flex-col h-full">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">タスク一覧</h2>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          新規タスク
        </button>
      </div>

      <TaskFilter
        categories={categories}
        users={users}
        currentUser={currentUser}
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

      {isFormOpen && (
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

export default TasksPage
