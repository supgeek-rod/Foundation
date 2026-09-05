<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useShortcutsStore } from '@/stores/shortcuts'
import { parseGroupsText, serializeGroups } from '@/utils/shortcutsText'

const open = defineModel<boolean>('open', { required: true })
const store = useShortcutsStore()

// ===== 文本模式 =====
const text = ref('')
const textErrors = ref<string[]>([])

// ===== 表单模式（批量添加） =====
interface FormRow {
  groupId: string
  name: string
  url: string
}
const rows = ref<FormRow[]>([])

watch(open, (v) => {
  if (!v) return
  textErrors.value = []
  text.value = serializeGroups(store.groups)
  rows.value = []
  addRow()
})

function addRow() {
  rows.value.push({ groupId: store.groups[0]?.id ?? '', name: '', url: '' })
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}

function ensureGroupId(row: FormRow): string {
  if (row.groupId && store.groups.some((g) => g.id === row.groupId)) return row.groupId
  const group = store.addGroup('常用')
  return group.id
}

function saveForm() {
  const valid = rows.value.filter((r) => r.name.trim() || r.url.trim())
  if (valid.length === 0) {
    toast.error('请至少填写一行网址')
    return
  }
  const invalid = valid.filter((r) => !r.url.trim())
  if (invalid.length > 0) {
    toast.error(`${invalid.length} 行未填写网址，请补全或删除该行`)
    return
  }
  for (const row of valid) {
    store.addSite(ensureGroupId(row), row.name, row.url)
  }
  toast.success(`已添加 ${valid.length} 个网址`)
  open.value = false
}

function saveText() {
  const result = parseGroupsText(text.value)
  if (!result.ok) {
    textErrors.value = result.errors
    return
  }
  textErrors.value = []
  const siteCount = result.groups.reduce((sum, g) => sum + g.sites.length, 0)
  store.groups = result.groups
  toast.success(`已保存 ${result.groups.length} 个分组、${siteCount} 个网址`)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>批量编辑快捷网址</DialogTitle>
        <DialogDescription>表单模式批量添加；文本模式编辑全部分组（增、删、改、排序）</DialogDescription>
      </DialogHeader>

      <Tabs default-value="form" class="gap-3">
        <TabsList>
          <TabsTrigger value="form">表单模式</TabsTrigger>
          <TabsTrigger value="text">文本模式</TabsTrigger>
        </TabsList>

        <TabsContent value="form" class="mt-0 space-y-2">
          <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
            <div
              v-for="(row, index) in rows"
              :key="index"
              class="grid grid-cols-1 items-center gap-2 sm:grid-cols-[130px_1fr_1.3fr_auto]"
            >
              <Select v-model="row.groupId">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="分组" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="g in store.groups" :key="g.id" :value="g.id">{{ g.name }}</SelectItem>
                </SelectContent>
              </Select>
              <Input v-model="row.name" placeholder="名称（选填）" />
              <Input v-model="row.url" placeholder="example.com" @keydown.enter="saveForm" />
              <Button
                variant="ghost"
                size="icon"
                class="size-8 justify-self-end text-muted-foreground hover:text-destructive"
                title="删除此行"
                @click="removeRow(index)"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <Button variant="outline" size="sm" @click="addRow">
              <Plus class="size-4" /> 添加一行
            </Button>
            <Button size="sm" @click="saveForm">保存</Button>
          </div>
        </TabsContent>

        <TabsContent value="text" class="mt-0 space-y-2">
          <p class="text-xs leading-relaxed text-muted-foreground">
            「#」开头的行为分组名，其余每行一个网址（名称与网址用空格分隔，名称可省略）；分组头之前的内容归入「常用」。保存后将<b class="text-foreground">整体替换</b>全部分组。
          </p>
          <textarea
            v-model="text"
            spellcheck="false"
            class="h-64 w-full resize-y rounded-lg border bg-muted/30 p-3 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-ring/50"
          ></textarea>
          <ul v-if="textErrors.length > 0" class="space-y-0.5 text-xs text-destructive">
            <li v-for="err in textErrors" :key="err">{{ err }}</li>
          </ul>
          <div class="flex items-center justify-between">
            <Button variant="outline" size="sm" @click="text = serializeGroups(store.groups); textErrors = []">
              恢复当前内容
            </Button>
            <Button size="sm" @click="saveText">保存并替换</Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
