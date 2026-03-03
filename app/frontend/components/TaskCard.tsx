import React from 'react'
import type { Task, Status, Priority } from '../types'

const STATUS_LABELS: Record<Status, string> = {
  pending: '未着手',
  responding: '対応中',
  finish: '完了',
}

const STATUS_COLORS: Record<Status, string> = {
  pending: 'bg-gray-100 text-gray-700',
  responding: 'bg-blue-100 text-blue-700',
  finish: 'bg-green-100 text-green-700',
}

const PRIORITY_LABELS: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const isOverdue =
    task.due_date && task.status !== 'finish' && new Date(task.due_date) < new Date()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* タイトルとバッジ */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
              優先度: {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {/* 説明 */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}

          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {task.category && (
              <span className="text-xs text-gray-500">
                {task.category.name}
              </span>
            )}
            {task.assignee && (
              <span className="text-xs text-gray-500">
                担当: {task.assignee.name}
              </span>
            )}
            {task.due_date && (
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {task.due_date}
                {isOverdue && ' (期限超過)'}
              </span>
            )}
          </div>

          {/* 作成者・更新者 */}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
            {task.created_by && <span>作成: {task.created_by.name}</span>}
            {task.updated_by && <span>更新: {task.updated_by.name}</span>}
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
          >
            編集
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
