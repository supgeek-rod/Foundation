<script setup lang="ts">
import { ArrowLeft, Hash, Plus, StickyNote, Trash2 } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNoteModal } from '@/composables/useNoteModal'
import { useNotesStore } from '@/stores/notes'
import type { NoteGroup } from '@/types/note'
import { formatLogTime } from '@/utils/format'

const { open } = useNoteModal()
const store = useNotesStore()

const selectedGroupId = ref('') // '' = 全部分组
const editingId = ref<string | null>(null)
const tagDraft = ref('')
const newGroupOpen = ref(false)
const newGroupName = ref('')
const confirm = ref<{
  open: boolean
  kind: 'note' | 'group'
  id: string
  name: string
  count: number
}>({ open: false, kind: 'note', id: '', name: '', count: 0 })

const filteredNotes = computed(() =>
  store.notes
    .filter((n) => !selectedGroupId.value || n.groupId === selectedGroupId.value)
    .sort((a, b) => b.updatedAt - a.updatedAt),
)
const editingNote = computed(() =>
  editingId.value ? store.notes.find((n) => n.id === editingId.value) ?? null : null,
)

watch(open, (v) => {
  if (!v) return
  editingId.value = null
  newGroupOpen.value = false
})
watch(editingNote, (note) => {
  tagDraft.value = note ? note.tags.join(' ') : ''
})

function selectGroup(id: string) {
  selectedGroupId.value = id
  editingId.value = null
}

function createGroup() {
  const name = newGroupName.value.trim()
  if (!name) {
    newGroupOpen.value = false
    return
  }
  const group = store.addGroup(name)
  newGroupName.value = ''
  newGroupOpen.value = false
  selectedGroupId.value = group.id
  toast.success(`分组「${group.name}」已创建`)
}

function newNote() {
  const groupId = selectedGroupId.value || store.groups[0]!.id
  const note = store.addNote(groupId)
  editingId.value = note.id
}

function parseTags() {
  if (!editingNote.value) return
  const tags = [
    ...new Set(
      tagDraft.value
        .split(/[,\s，、]+/)
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
    ),
  ]
  store.updateNote(editingNote.value.id, { tags })
}

/** 回车提交标签并清空输入，方便连续录入 */
function commitTags() {
  parseTags()
  tagDraft.value = ''
}

function askDeleteNote() {
  if (!editingNote.value) return
  confirm.value = {
    open: true,
    kind: 'note',
    id: editingNote.value.id,
    name: editingNote.value.title || '无标题',
    count: 0,
  }
}

function askDeleteGroup(group: NoteGroup) {
  confirm.value = {
    open: true,
    kind: 'group',
    id: group.id,
    name: group.name,
    count: store.countByGroup.get(group.id) ?? 0,
  }
}

function onConfirm() {
  if (confirm.value.kind === 'note') {
    store.removeNote(confirm.value.id)
    editingId.value = null
    toast.success('笔记已删除')
    return
  }
  const result = store.removeGroup(confirm.value.id)
  if (!result.ok) {
    toast.error('至少保留一个分组')
    return
  }
  if (selectedGroupId.value === confirm.value.id) selectedGroupId.value = ''
  if (editingId.value) editingId.value = null
  toast.success(
    result.moved > 0 ? `分组已删除，${result.moved} 个笔记移动到「${result.toName}」` : '分组已删除',
  )
}

function groupName(id: string): string {
  return store.groups.find((g) => g.id === id)?.name ?? ''
}

function moveEditingGroup(v: unknown) {
  if (editingNote.value) store.moveNote(editingNote.value.id, String(v))
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="glass-strong grid h-[min(88dvh,42rem)] w-[min(94vw,52rem)] grid-cols-1 overflow-hidden p-0 sm:max-w-[52rem] md:grid-cols-[150px_1fr]"
      :show-close-button="true"
    >
      <DialogTitle class="sr-only">笔记</DialogTitle>
      <DialogDescription class="sr-only">按分组管理笔记，支持标题、内容与标签</DialogDescription>

      <!-- 左侧：分组 -->
      <aside class="flex min-h-0 flex-col border-b border-border/40 bg-black/[0.03] p-4 md:border-r md:border-b-0 dark:border-white/10 dark:bg-white/[0.04]">
        <div class="mb-3 flex items-center gap-2 px-1">
          <StickyNote class="size-4" />
          <h2 class="text-sm font-bold">笔记</h2>
          <span class="text-xs text-muted-foreground">{{ store.notes.length }}</span>
        </div>
        <ScrollArea class="min-h-0 flex-1">
          <div class="space-y-0.5 pr-2">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-foreground/5"
              :class="selectedGroupId === '' ? 'bg-card font-medium shadow-sm' : ''"
              @click="selectGroup('')"
            >
              <span>全部</span>
              <span class="text-xs text-muted-foreground">{{ store.notes.length }}</span>
            </button>
            <div
              v-for="group in store.groups"
              :key="group.id"
              class="group/g relative"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 pr-7 text-sm transition-colors hover:bg-foreground/5"
                :class="selectedGroupId === group.id ? 'bg-card font-medium shadow-sm' : ''"
                @click="selectGroup(group.id)"
              >
                <span class="truncate">{{ group.name }}</span>
                <span class="text-xs text-muted-foreground">{{ store.countByGroup.get(group.id) ?? 0 }}</span>
              </button>
              <button
                v-if="store.groups.length > 1"
                type="button"
                class="absolute top-1/2 right-1 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/g:opacity-100"
                title="删除分组（组内笔记移到其他分组）"
                @click="askDeleteGroup(group)"
              >
                <Trash2 class="size-3" />
              </button>
            </div>
          </div>
        </ScrollArea>
        <div class="pt-3">
          <input
            v-if="newGroupOpen"
            v-model="newGroupName"
            placeholder="分组名称，回车创建"
            class="h-8 w-full rounded-md border bg-background/60 px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            @keydown.enter="createGroup"
            @keydown.esc="newGroupOpen = false"
            @blur="createGroup"
          />
          <button
            v-else
            type="button"
            class="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            @click="newGroupOpen = true"
          >
            <Plus class="size-3.5" /> 新建分组
          </button>
        </div>
      </aside>

      <!-- 右侧：列表 / 编辑器 -->
      <main class="flex min-h-0 flex-col">
        <!-- 编辑器 -->
        <template v-if="editingNote">
          <div class="flex items-center gap-1 border-b border-border/40 px-3 py-2 dark:border-white/10">
            <Button variant="ghost" size="sm" class="h-7 gap-1 text-xs" @click="editingId = null">
              <ArrowLeft class="size-3.5" /> 返回
            </Button>
            <span class="flex-1" />
            <span class="text-xs text-muted-foreground">更新于 {{ formatLogTime(editingNote.updatedAt) }}</span>
            <Button
              variant="ghost"
              size="sm"
              class="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
              @click="askDeleteNote"
            >
              <Trash2 class="size-3.5" /> 删除
            </Button>
          </div>
          <div class="flex min-h-0 flex-1 flex-col px-5 py-3">
            <input
              :value="editingNote.title"
              placeholder="标题"
              class="mb-2 bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground/60"
              @input="store.updateNote(editingNote.id, { title: ($event.target as HTMLInputElement).value })"
            />
            <textarea
              :value="editingNote.content"
              placeholder="内容…"
              class="min-h-0 flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60"
              @input="store.updateNote(editingNote.id, { content: ($event.target as HTMLTextAreaElement).value })"
            ></textarea>
            <div class="space-y-2 border-t border-border/40 pt-2 dark:border-white/10">
              <div v-if="editingNote.tags.length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in editingNote.tags"
                  :key="tag"
                  class="flex items-center gap-0.5 rounded-md bg-foreground/5 px-1.5 py-0.5 text-xs text-muted-foreground"
                >
                  <Hash class="size-3" />{{ tag }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Input
                  :model-value="tagDraft"
                  placeholder="标签（空格或逗号分隔，回车确认）"
                  class="h-8 flex-1 text-xs"
                  @update:model-value="tagDraft = String($event)"
                  @keydown.enter="commitTags"
                  @blur="parseTags"
                />
                <Select
                  :model-value="editingNote.groupId"
                  @update:model-value="moveEditingGroup"
                >
                  <SelectTrigger class="h-8 w-28 shrink-0 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="g in store.groups" :key="g.id" :value="g.id">{{ g.name }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </template>

        <!-- 列表 -->
        <template v-else>
          <div class="flex items-center justify-between border-b border-border/40 px-4 py-2 dark:border-white/10">
            <span class="text-sm text-muted-foreground">
              {{ selectedGroupId === '' ? '全部笔记' : `分组：${groupName(selectedGroupId)}` }}
            </span>
            <Button size="sm" class="h-7 gap-1 text-xs" @click="newNote">
              <Plus class="size-3.5" /> 新建笔记
            </Button>
          </div>
          <ScrollArea class="min-h-0 flex-1">
            <div class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
              <div v-if="filteredNotes.length === 0" class="col-span-full py-14 text-center text-sm text-muted-foreground">
                还没有笔记，点右上角「新建笔记」开始
              </div>
              <button
                v-for="note in filteredNotes"
                :key="note.id"
                type="button"
                class="flex flex-col items-start gap-1.5 rounded-xl border bg-card/60 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                @click="editingId = note.id"
              >
                <span class="w-full truncate text-sm font-semibold">{{ note.title || '无标题' }}</span>
                <span v-if="note.content" class="line-clamp-2 w-full text-xs leading-relaxed text-muted-foreground">
                  {{ note.content }}
                </span>
                <span class="flex flex-wrap items-center gap-1">
                  <span
                    v-for="tag in note.tags"
                    :key="tag"
                    class="flex items-center rounded bg-foreground/5 px-1 text-xs text-muted-foreground"
                  >
                    <Hash class="size-2.5" />{{ tag }}
                  </span>
                </span>
                <span class="text-[10px] text-muted-foreground/70">
                  {{ groupName(note.groupId) }} · {{ formatLogTime(note.updatedAt) }}
                </span>
              </button>
            </div>
          </ScrollArea>
        </template>
      </main>

      <ConfirmDialog
        v-model:open="confirm.open"
        :title="confirm.kind === 'note' ? '删除笔记' : '删除分组'"
        :desc="
          confirm.kind === 'note'
            ? `确定删除笔记「${confirm.name}」吗？删除后无法恢复。`
            : `分组「${confirm.name}」内的 ${confirm.count} 个笔记将移动到其他分组。`
        "
        :danger="confirm.kind === 'note'"
        :confirm-text="confirm.kind === 'note' ? '删除' : '删除分组'"
        @confirmed="onConfirm"
      />
    </DialogContent>
  </Dialog>
</template>
