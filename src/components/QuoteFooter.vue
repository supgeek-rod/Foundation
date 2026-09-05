<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'
import { useQuote } from '@/composables/useQuote'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()
const { quote, refresh } = useQuote()
</script>

<template>
  <footer v-if="store.settings.showQuote" class="flex justify-center px-4 pb-6">
    <button
      type="button"
      class="page-text group flex max-w-[80vw] items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
      title="换一句"
      @click="refresh"
    >
      <span class="truncate">「{{ quote.text }}」</span>
      <span v-if="quote.from" class="shrink-0 opacity-70">—— {{ quote.from }}</span>
      <RefreshCw
        class="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
      />
    </button>
  </footer>
</template>
