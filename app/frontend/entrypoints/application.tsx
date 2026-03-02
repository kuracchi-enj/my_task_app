import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskApp from '../components/TaskApp'
import '../styles/application.css'

const container = document.getElementById('task-app')
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <TaskApp />
    </React.StrictMode>
  )
}
