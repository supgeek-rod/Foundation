<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const open = defineModel<boolean>('open', { required: true })

defineProps<{
  title: string
  desc?: string
  confirmText?: string
  danger?: boolean
}>()

const emit = defineEmits<{ confirmed: [] }>()
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-xs" :show-close-button="false">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="desc">{{ desc }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="open = false">取消</Button>
        <Button
          :variant="danger ? 'destructive' : 'default'"
          @click="
            open = false;
            emit('confirmed')
          "
        >
          {{ confirmText ?? '确定' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
