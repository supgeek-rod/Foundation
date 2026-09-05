<script setup lang="ts">
import { Settings } from '@lucide/vue'
import { useSettingsModal } from '@/composables/useSettingsModal'

const { show } = useSettingsModal()
</script>

<template>
  <button
    type="button"
    class="glass flex size-10 items-center justify-center rounded-full text-white transition-transform hover:rotate-45 hover:scale-105 active:scale-95"
    title="设置"
    @click="show"
  >
    <Settings class="size-5" />
  </button>
</template>
