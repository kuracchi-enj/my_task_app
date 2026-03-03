import { useState, useEffect } from 'react'
import type { User } from '../types'

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/users')
      .then((res) => res.json())
      .then((data: User[]) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { users, loading }
}

export default useUsers
