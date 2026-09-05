import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Note, NoteGroup } from '@/types/note'
import { uid } from '@/utils/id'

export interface RemoveGroupResult {
  ok: boolean
  moved: number
  toName: string
}

export const useNotesStore = defineStore(
  'notes',
  () => {
    const groups = ref<NoteGroup[]>([])
    const notes = ref<Note[]>([])

    // 始终保证存在一个分组，笔记不允许「无分组」
    if (groups.value.length === 0) {
      groups.value = [{ id: uid(), name: '默认' }]
    }

    const countByGroup = computed(() => {
      const map = new Map<string, number>()
      for (const note of notes.value) {
        map.set(note.groupId, (map.get(note.groupId) ?? 0) + 1)
      }
      return map
    })

    function findGroup(id: string): NoteGroup | undefined {
      return groups.value.find((g) => g.id === id)
    }
    function findNote(id: string): Note | undefined {
      return notes.value.find((n) => n.id === id)
    }

    /** 同名分组直接复用，避免重复 */
    function addGroup(name: string): NoteGroup {
      const trimmed = name.trim() || '新分组'
      const existing = groups.value.find((g) => g.name === trimmed)
      if (existing) return existing
      const group: NoteGroup = { id: uid(), name: trimmed }
      groups.value.push(group)
      return group
    }

    /** 删除分组，组内笔记移动到其余第一个分组；只剩一个分组时不可删除 */
    function removeGroup(id: string): RemoveGroupResult {
      if (groups.value.length <= 1) return { ok: false, moved: 0, toName: '' }
      const group = findGroup(id)
      if (!group) return { ok: false, moved: 0, toName: '' }
      const target = groups.value.find((g) => g.id !== id)!
      let moved = 0
      for (const note of notes.value) {
        if (note.groupId === id) {
          note.groupId = target.id
          moved += 1
        }
      }
      groups.value = groups.value.filter((g) => g.id !== id)
      return { ok: true, moved, toName: target.name }
    }

    function addNote(groupId: string): Note {
      const now = Date.now()
      const note: Note = {
        id: uid(),
        title: '无标题',
        content: '',
        tags: [],
        groupId,
        createdAt: now,
        updatedAt: now,
      }
      notes.value.unshift(note)
      return note
    }

    function updateNote(id: string, partial: Partial<Omit<Note, 'id' | 'createdAt'>>) {
      const note = findNote(id)
      if (!note) return
      Object.assign(note, partial)
      note.updatedAt = Date.now()
    }

    function removeNote(id: string) {
      notes.value = notes.value.filter((n) => n.id !== id)
    }

    function moveNote(id: string, groupId: string) {
      const note = findNote(id)
      if (note && findGroup(groupId)) {
        note.groupId = groupId
        note.updatedAt = Date.now()
      }
    }

    return {
      groups,
      notes,
      countByGroup,
      addGroup,
      removeGroup,
      addNote,
      updateNote,
      removeNote,
      moveNote,
    }
  },
  { persist: true },
)
