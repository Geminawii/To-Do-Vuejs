

export interface LocalCategory {
  id: number
  name: string
}

export interface Todo {
  id: string | number
  todo: string
  completed: boolean
  userId?: number
  date?: string
  priority?: 'low' | 'medium' | 'high'
  description?: string     
}
