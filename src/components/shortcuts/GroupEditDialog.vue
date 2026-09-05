<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
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

const props = defineProps<{
  /** 重命名时传入分组，新增时为 null */
  group: { id: string; name: string } | null
}>()

const open = defineModel<boolean>('open', { required: true })
const store = useShortcutsStore()
const name = ref('')

watch(open, (v) => {
  if (!v) return
  name.value = props.group?.name ?? ''
})

function save() {
  if (!name.value.trim()) {
    toast.error('请输入分组名称')
    return
  }
  if (props.group) {
    store.renameGroup(props.group.id, name.value)
    toast.success('已保存')
  } else {
    store.addGroup(name.value)
    toast.success('分组已创建')
  }
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-xs">
      <DialogHeader>
        <DialogTitle>{{ group ? '重命名分组' : '新建分组' }}</DialogTitle>
        <DialogDescription>分组将显示在主页快捷方式区域</DialogDescription>
      </DialogHeader>
      <Input v-model="name" placeholder="分组名称" @keydown.enter="save" />
      <DialogFooter>
        <Button variant="outline" @click="open = false">取消</Button>
        <Button @click="save">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
