export interface TodoItem {
  id: string
  text: string
  done: boolean
  createdAt: number
  completedAt?: number
}

export interface TodoGroup {
  id: string
  name: string
  todos: TodoItem[]
}

export type TodoAction =
  | 'create'
  | 'complete'
  | 'uncomplete'
  | 'delete'
  | 'addGroup'
  | 'renameGroup'
  | 'removeGroup'
  | 'clearCompleted'

export interface TodoLogEntry {
  id: string
  time: number
  action: TodoAction
  detail: string
}
