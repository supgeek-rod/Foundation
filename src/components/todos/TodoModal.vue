<script setup lang="ts">
import { Check, Pencil, Plus, Trash2, X } from '@lucide/vue'
import { nextTick, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTodoModal } from '@/composables/useTodoModal'
import { useTodosStore } from '@/stores/todos'
import type { TodoGroup } from '@/types/todo'
import { formatLogTime } from '@/utils/format'

const { open } = useTodoModal()
const store = useTodosStore()

const tab = ref<'list' | 'log'>('list')
const addingFor = ref<string | null>(null)
const addText = ref('')
const renamingId = ref<string | null>(null)
const renameText = ref('')
const newGroupOpen = ref(false)
const newGroupName = ref('')
const confirm = ref<{ open: boolean; id: string; name: string; count: number }>({
  open: false,
  id: '',
  name: '',
  count: 0,
})

const addInputRefs = new Map<string, HTMLInputElement>()

function setAddInputRef(el: unknown, groupId: string) {
  if (el instanceof HTMLInputElement) addInputRefs.set(groupId, el)
  else addInputRefs.delete(groupId)
}

watch(addingFor, async (id) => {
  if (!id) return
  await nextTick()
  addInputRefs.get(id)?.focus()
})
watch(open, async (v) => {
  if (v) {
    await nextTick()
    if (store.groups.length === 0) newGroupOpen.value = true
  }
})

function startAdd(group: TodoGroup) {
  addingFor.value = group.id
  addText.value = ''
}
function submitAdd(group: TodoGroup) {
  const text = addText.value
  if (!text.trim()) {
    addingFor.value = null
    return
  }
  store.addTodo(group.id, text)
  addText.value = ''
  void nextTick(() => addInputRefs.get(group.id)?.focus())
}
function startRename(group: TodoGroup) {
  renamingId.value = group.id
  renameText.value = group.name
  void nextTick(() => document.getElementById(`todo-rename-${group.id}`)?.focus())
}
function submitRename(group: TodoGroup) {
  store.renameGroup(group.id, renameText.value)
  renamingId.value = null
}
function askRemoveGroup(group: TodoGroup) {
  confirm.value = {
    open: true,
    id: group.id,
    name: group.name,
    count: group.todos.length,
  }
}
function doRemoveGroup() {
  store.removeGroup(confirm.value.id)
  toast.success('分组已删除')
}
function createGroup() {
  const name = newGroupName.value.trim()
  if (!name) {
    newGroupOpen.value = false
    return
  }
  store.addGroup(name)
  newGroupName.value = ''
  newGroupOpen.value = false
  toast.success(`分组「${name}」已创建`)
}
function clearDone() {
  const count = store.clearCompleted()
  if (count === 0) toast.info('没有已完成的待办')
  else toast.success(`已清除 ${count} 个已完成待办`)
}
function visibleTodos(group: TodoGroup) {
  return store.hideDone ? group.todos.filter((t) => !t.done) : group.todos
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="glass-strong flex h-[min(85dvh,38rem)] w-[min(94vw,34rem)] flex-col overflow-hidden p-0 sm:max-w-[34rem]"
      :show-close-button="true"
    >
      <DialogTitle class="sr-only">待办清单</DialogTitle>
      <DialogDescription class="sr-only">分组管理待办与操作日志</DialogDescription>

      <div class="flex items-center justify-between px-5 pt-4">
        <div>
          <h2 class="text-lg font-bold">待办清单</h2>
          <p class="text-xs text-muted-foreground">已完成 {{ store.doneCount }} / 共 {{ store.total }}</p>
        </div>
        <Tabs v-model="tab" class="gap-0">
          <TabsList class="h-8">
            <TabsTrigger value="list" class="px-3 text-xs">待办</TabsTrigger>
            <TabsTrigger value="log" class="px-3 text-xs">日志</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs v-model="tab" class="flex min-h-0 flex-1 flex-col gap-0">
        <TabsContent value="list" class="mt-0 min-h-0 flex-1">
          <ScrollArea class="h-full">
            <div class="space-y-5 px-5 py-4">
              <div v-if="store.groups.length === 0" class="py-10 text-center text-sm text-muted-foreground">
                还没有分组，先新建一个吧
              </div>

              <section v-for="group in store.groups" :key="group.id">
                <div class="group/header mb-1.5 flex items-center gap-2">
                  <template v-if="renamingId === group.id">
                    <input
                      :id="`todo-rename-${group.id}`"
                      v-model="renameText"
                      class="h-7 flex-1 rounded-md border bg-background/60 px-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                      @keydown.enter="submitRename(group)"
                      @keydown.esc="renamingId = null"
                      @blur="submitRename(group)"
                    />
                  </template>
                  <template v-else>
                    <h3 class="text-sm font-semibold">{{ group.name }}</h3>
                    <span class="text-xs text-muted-foreground">
                      {{ group.todos.filter((t) => t.done).length }}/{{ group.todos.length }}
                    </span>
                    <span class="flex-1" />
                    <button
                      type="button"
                      class="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/5 hover:text-foreground group-hover/header:opacity-100"
                      title="重命名分组"
                      @click="startRename(group)"
                    >
                      <Pencil class="size-3.5" />
                    </button>
                    <button
                      type="button"
                      class="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/5 hover:text-destructive group-hover/header:opacity-100"
                      title="删除分组"
                      @click="askRemoveGroup(group)"
                    >
                      <Trash2 class="size-3.5" />
                    </button>
                  </template>
                </div>

                <ul class="space-y-0.5">
                  <li
                    v-for="todo in visibleTodos(group)"
                    :key="todo.id"
                    class="group/todo flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-foreground/5"
                  >
                    <button
                      type="button"
                      class="flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors"
                      :class="
                        todo.done
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-foreground/40 hover:border-primary'
                      "
                      :title="todo.done ? '取消完成' : '标记完成'"
                      @click="store.toggleTodo(group.id, todo.id)"
                    >
                      <Check v-if="todo.done" class="size-3" />
                    </button>
                    <span
                      class="flex-1 text-sm"
                      :class="todo.done ? 'text-muted-foreground line-through' : ''"
                      >{{ todo.text }}</span
                    >
                    <button
                      type="button"
                      class="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/todo:opacity-100"
                      title="删除"
                      @click="store.removeTodo(group.id, todo.id)"
                    >
                      <X class="size-3.5" />
                    </button>
                  </li>
                </ul>

                <div class="mt-0.5 px-2">
                  <input
                    v-if="addingFor === group.id"
                    :ref="(el) => setAddInputRef(el, group.id)"
                    v-model="addText"
                    placeholder="输入待办，回车创建（Esc 结束）"
                    class="h-8 w-full rounded-md border bg-background/60 px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                    @keydown.enter="submitAdd(group)"
                    @keydown.esc="addingFor = null"
                    @blur="submitAdd(group)"
                  />
                  <button
                    v-else
                    type="button"
                    class="flex items-center gap-1.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    @click="startAdd(group)"
                  >
                    <Plus class="size-3.5" /> 添加待办
                  </button>
                </div>
              </section>

              <div class="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <template v-if="newGroupOpen">
                  <input
                    v-model="newGroupName"
                    placeholder="分组名称，回车创建"
                    class="h-8 flex-1 rounded-md border bg-background/60 px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                    @keydown.enter="createGroup()"
                    @keydown.esc="newGroupOpen = false"
                    @blur="createGroup()"
                  />
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    @click="newGroupOpen = true"
                  >
                    <Plus class="size-4" /> 新建分组
                  </button>
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      title="清除全部已完成的待办"
                      @click="clearDone"
                    >
                      清除已完成
                    </button>
                    <label class="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      隐藏已完成
                      <Switch
                        :model-value="store.hideDone"
                        @update:model-value="(v: boolean) => (store.hideDone = v)"
                      />
                    </label>
                  </div>
                </template>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="log" class="mt-0 min-h-0 flex-1">
          <ScrollArea class="h-full">
            <div class="space-y-3 px-5 py-4">
              <div class="flex justify-end">
                <Button variant="ghost" size="sm" class="h-7 text-xs text-muted-foreground" @click="store.clearLogs()">
                  清空日志
                </Button>
              </div>
              <div v-if="store.logs.length === 0" class="py-10 text-center text-sm text-muted-foreground">
                暂无日志
              </div>
              <ul v-else class="space-y-1">
                <li
                  v-for="entry in store.logs"
                  :key="entry.id"
                  class="flex items-baseline gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-foreground/5"
                >
                  <span class="shrink-0 font-mono text-xs text-muted-foreground">
                    {{ formatLogTime(entry.time) }}
                  </span>
                  <span class="min-w-0 flex-1 truncate">{{ entry.detail }}</span>
                </li>
              </ul>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        v-model:open="confirm.open"
        title="删除分组"
        :desc="
          confirm.count > 0
            ? `分组「${confirm.name}」内有 ${confirm.count} 个待办，删除后无法恢复。`
            : `确定删除分组「${confirm.name}」吗？`
        "
        danger
        confirm-text="删除"
        @confirmed="doRemoveGroup"
      />
    </DialogContent>
  </Dialog>
</template>
