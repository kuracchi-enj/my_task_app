import React from 'react'
import { createRoot } from 'react-dom/client'
import LoginForm from '../components/LoginForm'
import '../styles/application.css'

const container = document.getElementById('login-app')
if (container) {
  createRoot(container).render(<LoginForm />)
}
