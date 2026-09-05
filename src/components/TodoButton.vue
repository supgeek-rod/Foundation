<script setup lang="ts">
import { ListTodo } from '@lucide/vue'
import { useTodoModal } from '@/composables/useTodoModal'

const { show } = useTodoModal()
</script>

<template>
  <button
    type="button"
    class="glass flex size-10 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
    title="待办清单"
    @click="show"
  >
    <ListTodo class="size-5" />
  </button>
</template>
