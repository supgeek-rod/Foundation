<script setup lang="ts">
import { Pencil, Plus, RotateCcw, Star, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import SearchEngineIcon from '@/components/SearchEngineIcon.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/settings'
import type { SearchEngine } from '@/types/search'

const store = useSettingsStore()

const dialogOpen = ref(false)
const editing = ref<SearchEngine | null>(null)
const name = ref('')
const url = ref('')

function openAdd() {
  editing.value = null
  name.value = ''
  url.value = ''
  dialogOpen.value = true
}

function openEdit(engine: SearchEngine) {
  editing.value = engine
  name.value = engine.name
  url.value = engine.url
  dialogOpen.value = true
}

function save() {
  if (!name.value.trim()) {
    toast.error('请输入引擎名称')
    return
  }
  if (!url.value.includes('{query}')) {
    toast.error('URL 模板必须包含 {query} 占位符')
    return
  }
  if (editing.value) {
    store.updateEngine(editing.value.id, { name: name.value.trim(), url: url.value.trim() })
    toast.success('已保存')
  } else {
    let hue = 0
    for (const ch of name.value) hue = (hue * 31 + ch.charCodeAt(0)) % 360
    store.addEngine({ name: name.value.trim(), url: url.value.trim(), color: `hsl(${hue} 55% 45%)` })
    toast.success('引擎已添加')
  }
  dialogOpen.value = false
}

function remove(engine: SearchEngine) {
  if (store.removeEngine(engine.id)) toast.success('已删除')
}

function setDefault(id: string) {
  store.currentEngineId = id
  toast.success('已设为默认搜索引擎')
}

function reset() {
  store.resetEngines()
  toast.success('已恢复默认搜索引擎')
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-muted-foreground">点击任意引擎设为默认；Tab 键可在搜索框快速切换引擎。</p>

    <div
      v-for="engine in store.searchEngines"
      :key="engine.id"
      class="flex cursor-pointer items-center gap-3 rounded-xl bg-muted/70 px-4 py-3 transition-colors hover:bg-muted"
      @click="setDefault(engine.id)"
    >
      <SearchEngineIcon :engine="engine" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 text-sm font-medium">
          {{ engine.name }}
          <Star v-if="engine.id === store.currentEngineId" class="size-3.5 fill-amber-400 text-amber-400" />
        </div>
        <div class="truncate text-xs text-muted-foreground">{{ engine.url }}</div>
      </div>
      <Button variant="ghost" size="icon" class="size-8" title="编辑" @click.stop="openEdit(engine)">
        <Pencil class="size-4" />
      </Button>
      <Button
        v-if="!engine.builtin"
        variant="ghost"
        size="icon"
        class="size-8 text-destructive hover:text-destructive"
        title="删除"
        @click.stop="remove(engine)"
      >
        <Trash2 class="size-4" />
      </Button>
    </div>

    <div class="flex gap-2 pt-1">
      <Button @click="openAdd"><Plus class="size-4" /> 添加搜索引擎</Button>
      <Button variant="outline" @click="reset"><RotateCcw class="size-4" /> 恢复默认</Button>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{{ editing ? '编辑搜索引擎' : '添加搜索引擎' }}</DialogTitle>
          <DialogDescription>URL 中使用 {query} 表示搜索关键词</DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="engine-name">名称</label>
            <Input id="engine-name" v-model="name" placeholder="如：搜狗" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="engine-url">URL 模板</label>
            <Input id="engine-url" v-model="url" placeholder="https://www.sogou.com/web?query={query}" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">取消</Button>
          <Button @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
