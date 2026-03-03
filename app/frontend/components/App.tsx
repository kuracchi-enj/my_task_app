import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import Sidebar from './Sidebar'
import TasksPage from './TasksPage'
import CategoryPage from './CategoryPage'
import GroupPage from './GroupPage'

const LOGOUT_PATH = '/logout'

const App: React.FC = () => {
  const { currentUser, loading } = useCurrentUser()

  const handleLogout = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar currentUser={currentUser} onLogout={handleLogout} />

        <main className="flex-1 px-6 py-6 overflow-y-auto">
          {currentUser ? (
            <Routes>
              <Route path="/" element={<TasksPage currentUser={currentUser} />} />
              <Route path="/categories" element={<CategoryPage />} />
              {currentUser.is_admin && (
                <Route path="/groups" element={<GroupPage />} />
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-gray-400 text-sm">ユーザー情報を取得できませんでした</p>
            </div>
          )}
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
