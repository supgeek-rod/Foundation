<script setup lang="ts">
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
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
import { useShortcutsStore } from '@/stores/shortcuts'

const store = useShortcutsStore()

const dialogOpen = ref(false)
const editing = ref<{ id: string; name: string } | null>(null)
const name = ref('')
const confirm = ref<{ open: boolean; id: string; name: string; count: number }>({
  open: false,
  id: '',
  name: '',
  count: 0,
})

function openAdd() {
  editing.value = null
  name.value = ''
  dialogOpen.value = true
}

function openRename(group: { id: string; name: string }) {
  editing.value = group
  name.value = group.name
  dialogOpen.value = true
}

function save() {
  if (!name.value.trim()) {
    toast.error('请输入分组名称')
    return
  }
  if (editing.value) {
    store.renameGroup(editing.value.id, name.value)
    toast.success('已保存')
  } else {
    store.addGroup(name.value)
    toast.success('分组已创建')
  }
  dialogOpen.value = false
}

function askRemove(group: { id: string; name: string; sites: unknown[] }) {
  confirm.value = {
    open: true,
    id: group.id,
    name: group.name,
    count: group.sites.length,
  }
}

function doRemove() {
  store.removeGroup(confirm.value.id)
  toast.success('分组已删除')
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-muted-foreground">主页快捷方式按分组展示，可在主页拖拽网址跨分组移动。</p>

    <div
      v-for="(group, index) in store.groups"
      :key="group.id"
      class="flex items-center gap-3 rounded-xl bg-muted/70 px-4 py-3"
    >
      <div class="min-w-0 flex-1">
        <div class="text-sm font-medium">{{ group.name }}</div>
        <div class="text-xs text-muted-foreground">{{ group.sites.length }} 个网址</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        title="上移"
        :disabled="index === 0"
        @click="store.moveGroup(group.id, -1)"
      >
        <ChevronUp class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        title="下移"
        :disabled="index === store.groups.length - 1"
        @click="store.moveGroup(group.id, 1)"
      >
        <ChevronDown class="size-4" />
      </Button>
      <Button variant="ghost" size="icon" class="size-8" title="重命名" @click="openRename(group)">
        <Pencil class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-8 text-destructive hover:text-destructive"
        title="删除"
        @click="askRemove(group)"
      >
        <Trash2 class="size-4" />
      </Button>
    </div>

    <Button class="mt-1" @click="openAdd"><Plus class="size-4" /> 新建分组</Button>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>{{ editing ? '重命名分组' : '新建分组' }}</DialogTitle>
          <DialogDescription>分组将显示在主页快捷方式区域</DialogDescription>
        </DialogHeader>
        <Input v-model="name" placeholder="分组名称" @keydown.enter="save" />
        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">取消</Button>
          <Button @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      v-model:open="confirm.open"
      title="删除分组"
      :desc="
        confirm.count > 0
          ? `分组「${confirm.name}」内有 ${confirm.count} 个网址，删除后无法恢复。`
          : `确定删除分组「${confirm.name}」吗？`
      "
      danger
      confirm-text="删除"
      @confirmed="doRemove"
    />
  </div>
</template>
