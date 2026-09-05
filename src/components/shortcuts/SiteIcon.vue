<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { faviconUrl } from '@/services/faviconApi'

const props = defineProps<{
  name: string
  url: string
}>()

const failed = ref(false)
watch(
  () => props.url,
  () => {
    failed.value = false
  },
)

const src = computed(() => faviconUrl(props.url))
const letter = computed(() => props.name.trim().slice(0, 1).toUpperCase() || '?')
const hue = computed(() => {
  let hash = 0
  for (const ch of props.name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  return hash
})
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    alt=""
    loading="lazy"
    class="size-7 rounded-md object-contain"
    @error="failed = true"
  />
  <span
    v-else
    class="flex size-7 items-center justify-center rounded-md text-xs font-bold text-white"
    :style="{ background: `hsl(${hue} 55% 45%)` }"
  >
    {{ letter }}
  </span>
</template>
