<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()
const { isDark } = useTheme()

const icon = computed(() => (isDark.value ? Sun : Moon))

function toggle() {
  store.updateSettings({ theme: isDark.value ? 'light' : 'dark' })
}
</script>

<template>
  <button
    type="button"
    class="glass flex size-10 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
    :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
    @click="toggle"
  >
    <component :is="icon" class="size-5" />
  </button>
</template>
