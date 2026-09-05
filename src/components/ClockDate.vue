<script setup lang="ts">
import { useClock } from '@/composables/useClock'
import { useSettingsStore } from '@/stores/settings'

defineProps<{
  /** 尺寸档位：normal 主页大钟，compact 备用 */
  size?: 'normal' | 'compact'
}>()

const { hours, minutes, dateText, weekText } = useClock()
const store = useSettingsStore()
</script>

<template>
  <div class="flex flex-col items-center text-white select-none">
    <time class="page-text font-light tracking-[0.05em] tabular-nums" :class="size === 'compact' ? 'text-5xl' : 'text-7xl md:text-8xl'">
      {{ hours }}<span class="mx-1 opacity-80">:</span>{{ minutes }}
    </time>
    <div v-if="store.settings.showFullDate" class="page-text mt-3 text-lg text-white/95 md:text-xl">
      {{ dateText }} {{ weekText }}
    </div>
  </div>
</template>
