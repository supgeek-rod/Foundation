<script setup lang="ts">
import { Shuffle } from '@lucide/vue'
import { computed } from 'vue'
import { useBackground } from '@/composables/useBackground'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()
const { refreshPicsum } = useBackground()

// 仅在使用随机图库背景时显示
const visible = computed(() => store.settings.background.source === 'picsum')
</script>

<template>
  <button
    v-if="visible"
    type="button"
    class="glass flex size-10 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
    title="更换背景图"
    @click="refreshPicsum"
  >
    <Shuffle class="size-5" />
  </button>
</template>
