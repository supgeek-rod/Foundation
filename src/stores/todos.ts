import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TodoGroup, TodoLogEntry, TodoAction } from '@/types/todo'
import { uid } from '@/utils/id'

const LOG_LIMIT = 200

export const useTodosStore = defineStore(
  'todos',
  () => {
    const groups = ref<TodoGroup[]>([])
    const logs = ref<TodoLogEntry[]>([])
    /** 列表视图：隐藏已完成 */
    const hideDone = ref(false)

    const total = computed(() => groups.value.reduce((sum, g) => sum + g.todos.length, 0))
    const doneCount = computed(() =>
      groups.value.reduce((sum, g) => sum + g.todos.filter((t) => t.done).length, 0),
    )

    function log(action: TodoAction, detail: string) {
      logs.value.unshift({ id: uid(), time: Date.now(), action, detail })
      if (logs.value.length > LOG_LIMIT) logs.value.length = LOG_LIMIT
    }

    function findGroup(id: string): TodoGroup | undefined {
      return groups.value.find((g) => g.id === id)
    }

    function addGroup(name: string): TodoGroup {
      const group: TodoGroup = { id: uid(), name: name.trim() || '新分组', todos: [] }
      groups.value.push(group)
      log('addGroup', `新建分组「${group.name}」`)
      return group
    }

    function renameGroup(id: string, name: string) {
      const group = findGroup(id)
      if (!group || !name.trim() || group.name === name.trim()) return
      const old = group.name
      group.name = name.trim()
      log('renameGroup', `分组「${old}」重命名为「${group.name}」`)
    }

    function removeGroup(id: string) {
      const group = findGroup(id)
      if (!group) return
      groups.value = groups.value.filter((g) => g.id !== id)
      log('removeGroup', `删除分组「${group.name}」（含 ${group.todos.length} 个待办）`)
    }

    function addTodo(groupId: string, text: string) {
      const group = findGroup(groupId)
      const trimmed = text.trim()
      if (!group || !trimmed) return
      group.todos.unshift({ id: uid(), text: trimmed, done: false, createdAt: Date.now() })
      log('create', `在「${group.name}」创建「${trimmed}」`)
    }

    function toggleTodo(groupId: string, todoId: string) {
      const todo = findGroup(groupId)?.todos.find((t) => t.id === todoId)
      if (!todo) return
      todo.done = !todo.done
      if (todo.done) {
        todo.completedAt = Date.now()
        log('complete', `完成「${todo.text}」`)
      } else {
        delete todo.completedAt
        log('uncomplete', `取消完成「${todo.text}」`)
      }
    }

    function removeTodo(groupId: string, todoId: string) {
      const group = findGroup(groupId)
      const index = group?.todos.findIndex((t) => t.id === todoId) ?? -1
      if (!group || index < 0) return
      const [todo] = group.todos.splice(index, 1)
      log('delete', `删除「${todo!.text}」`)
    }

    /** 清除全部已完成的待办，返回清除数量 */
    function clearCompleted(): number {
      let count = 0
      for (const group of groups.value) {
        const before = group.todos.length
        group.todos = group.todos.filter((t) => !t.done)
        count += before - group.todos.length
      }
      if (count > 0) log('clearCompleted', `清除 ${count} 个已完成待办`)
      return count
    }

    function clearLogs() {
      logs.value = []
    }

    return {
      groups,
      logs,
      hideDone,
      total,
      doneCount,
      addGroup,
      renameGroup,
      removeGroup,
      addTodo,
      toggleTodo,
      removeTodo,
      clearCompleted,
      clearLogs,
    }
  },
  { persist: true },
)
