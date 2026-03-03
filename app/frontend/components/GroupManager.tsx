import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import type { Group } from '../types'

const GROUPS_API_PATH = '/api/v1/groups'

const GroupManager: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await fetch(GROUPS_API_PATH)
      const data = await res.json()
      setGroups(data)
    } catch {
      setError('グループの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    const res = await api.post(GROUPS_API_PATH, { group: { name: newGroupName.trim() } })
    if (res.ok) {
      setNewGroupName('')
      await fetchGroups()
    } else {
      const data = await res.json()
      setError(data.errors?.join(', ') ?? 'グループの作成に失敗しました')
    }
  }

  const handleDelete = async (groupId: number) => {
    if (!confirm('このグループを削除しますか？')) return

    const res = await api.delete(`${GROUPS_API_PATH}/${groupId}`)
    if (res.ok) {
      await fetchGroups()
    } else {
      setError('グループの削除に失敗しました')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">グループ管理</h2>

      {error && (
        <div className="mb-3 p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="グループ名"
          className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          追加
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {groups.map((group) => (
            <li key={group.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-800">{group.name}</span>
                {group.admin && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">管理者</span>
                )}
              </div>
              {!group.admin && (
                <button
                  onClick={() => handleDelete(group.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  削除
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GroupManager
