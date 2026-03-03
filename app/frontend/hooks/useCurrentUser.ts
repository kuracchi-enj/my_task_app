import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import type { CurrentUser } from '../types'

const CURRENT_USER_API_PATH = '/api/v1/me'

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(CURRENT_USER_API_PATH)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CurrentUser | null) => setCurrentUser(data))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { currentUser, loading }
}
