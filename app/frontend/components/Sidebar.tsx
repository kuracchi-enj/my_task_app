import React from 'react'
import { NavLink } from 'react-router-dom'
import type { CurrentUser } from '../types'

interface SidebarProps {
  currentUser: CurrentUser | null
  onLogout: () => void
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700 font-medium'
      : 'text-gray-600 hover:bg-gray-100'
  }`

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r flex flex-col">
      {/* アプリ名 */}
      <div className="px-4 py-4 border-b">
        <h1 className="text-base font-bold text-gray-900">My Task App</h1>
        {currentUser && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {currentUser.group_name && `${currentUser.group_name} / `}
            {currentUser.name}
          </p>
        )}
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {/* タスク一覧 */}
        <NavLink to="/" end className={navLinkClass}>
          タスク一覧
        </NavLink>

        {/* 設定セクション */}
        <div className="mt-4">
          <p className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            設定
          </p>
          <div className="flex flex-col gap-1">
            <NavLink to="/categories" className={navLinkClass}>
              カテゴリ管理
            </NavLink>
            {currentUser?.is_admin && (
              <NavLink to="/groups" className={navLinkClass}>
                グループ管理
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* ログアウト */}
      <div className="px-3 py-4 border-t">
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 text-sm text-gray-600 text-left rounded-md hover:bg-gray-100 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
