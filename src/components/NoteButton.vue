<script setup lang="ts">
import { StickyNote } from '@lucide/vue'
import { useNoteModal } from '@/composables/useNoteModal'

const { show } = useNoteModal()
</script>

<template>
  <button
    type="button"
    class="glass flex size-10 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
    title="笔记"
    @click="show"
  >
    <StickyNote class="size-5" />
  </button>
</template>
