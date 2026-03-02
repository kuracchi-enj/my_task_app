import React from 'react'
import type { Task } from '../types'
import TaskCard from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  error: string | null
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, error, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500 text-sm">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        タスクがありません
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TaskList
