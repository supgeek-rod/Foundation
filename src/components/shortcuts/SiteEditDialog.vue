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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useShortcutsStore } from '@/stores/shortcuts'
import type { Site } from '@/types/shortcut'

const props = defineProps<{
  /** 编辑已有网址时传入，新增时为 null */
  site: Site | null
  groupId: string
}>()

const open = defineModel<boolean>('open', { required: true })
const store = useShortcutsStore()

const name = ref('')
const url = ref('')
const targetGroupId = ref(props.groupId)

watch(open, (v) => {
  if (!v) return
  name.value = props.site?.name ?? ''
  url.value = props.site?.url ?? ''
  targetGroupId.value = props.groupId
})

function save() {
  if (!url.value.trim()) {
    toast.error('请输入网址')
    return
  }
  if (props.site) {
    store.updateSite(props.groupId, props.site.id, {
      name: name.value,
      url: url.value,
      targetGroupId: targetGroupId.value,
    })
    toast.success('已保存')
  } else {
    store.addSite(targetGroupId.value, name.value, url.value)
    toast.success('已添加')
  }
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ site ? '编辑网址' : '添加网址' }}</DialogTitle>
        <DialogDescription>网址可省略 https:// 前缀</DialogDescription>
      </DialogHeader>
      <div class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium" for="site-name">名称</label>
          <Input id="site-name" v-model="name" placeholder="选填，默认使用网址" @keydown.enter="save" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium" for="site-url">网址</label>
          <Input id="site-url" v-model="url" placeholder="example.com" @keydown.enter="save" />
        </div>
        <div v-if="store.groups.length > 1" class="space-y-1.5">
          <label class="text-sm font-medium">所属分组</label>
          <Select v-model="targetGroupId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="选择分组" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="g in store.groups" :key="g.id" :value="g.id">{{ g.name }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="open = false">取消</Button>
        <Button @click="save">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
