export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  groupId: string
  createdAt: number
  updatedAt: number
}

export interface NoteGroup {
  id: string
  name: string
}
