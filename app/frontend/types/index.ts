export type Status = 'pending' | 'responding' | 'finish'
export type Priority = 'low' | 'medium' | 'high'

export interface Category {
  id: number
  name: string
}

export interface UserSummary {
  id: number
  name: string
}

export interface User {
  id: number
  login_id: string
  name: string
}

export interface Group {
  id: number
  name: string
  admin: boolean
}

export interface CurrentUser {
  id: number
  login_id: string
  name: string
  group_name: string | null
  is_admin: boolean
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  category: Category | null
  assignee: UserSummary | null
  created_by: UserSummary | null
  updated_by: UserSummary | null
  created_at: string
  updated_at: string
}

export interface TaskFormData {
  title: string
  description: string
  status: Status
  priority: Priority
  due_date: string
  category_id: number | ''
  assignee_id: number | ''
}

export interface FilterParams {
  q: string
  status: Status | ''
  category_id: number | ''
  priority: Priority | ''
  assignee_id: number | 'all'
}
