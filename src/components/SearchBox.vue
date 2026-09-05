<script setup lang="ts">
import { Search } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'
import { computed, ref } from 'vue'
import SearchEngineIcon from '@/components/SearchEngineIcon.vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { fetchSuggestions } from '@/services/suggestionsApi'
import { useSettingsStore } from '@/stores/settings'
import { isLikelyUrl, normalizeUrl } from '@/utils/format'

const store = useSettingsStore()

const keyword = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const enginePickerOpen = ref(false)
const suggestions = ref<string[]>([])
const activeIndex = ref(-1)

const engine = computed(() => store.currentEngine)
const showSuggestions = computed(
  () => suggestions.value.length > 0 && keyword.value.trim().length > 0,
)

const loadSuggestions = useDebounceFn(async (kw: string) => {
  const q = kw.trim()
  if (!q || isLikelyUrl(q)) {
    suggestions.value = []
    return
  }
  try {
    suggestions.value = await fetchSuggestions(q)
  } catch {
    suggestions.value = []
  }
}, 180)

function onInput() {
  activeIndex.value = -1
  void loadSuggestions(keyword.value)
}

function openUrl(url: string, newTab: boolean) {
  if (newTab) window.open(url, '_blank', 'noopener')
  else window.location.href = url
}

function go(text?: string) {
  const q = (text ?? keyword.value).trim()
  if (!q) return
  suggestions.value = []
  keyword.value = q
  if (isLikelyUrl(q)) {
    openUrl(normalizeUrl(q), store.settings.openLinkInNewTab)
    return
  }
  openUrl(engine.value.url.replace('{query}', encodeURIComponent(q)), store.settings.openLinkInNewTab)
}

/** Tab / Shift+Tab 快速切换搜索引擎 */
function switchEngine(delta: 1 | -1) {
  const list = store.searchEngines
  if (list.length < 2) return
  const index = list.findIndex((e) => e.id === store.currentEngineId)
  const next = list[(index + delta + list.length) % list.length]!
  store.currentEngineId = next.id
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    switchEngine(e.shiftKey ? -1 : 1)
    return
  }
  if (showSuggestions.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % suggestions.value.length
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + suggestions.value.length) % suggestions.value.length
      return
    }
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    go(activeIndex.value >= 0 ? suggestions.value[activeIndex.value] : undefined)
    return
  }
  if (e.key === 'Escape') {
    suggestions.value = []
    inputEl.value?.blur()
  }
}

function pickEngine(id: string) {
  store.currentEngineId = id
  enginePickerOpen.value = false
  inputEl.value?.focus()
}

// 全局快捷键：/ 或 Ctrl/Cmd+K 聚焦搜索
function focusInput() {
  inputEl.value?.focus()
  inputEl.value?.select()
}

window.addEventListener('keydown', (e) => {
  const isSlash = e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey
  const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'
  if (!isSlash && !isCtrlK) return
  const target = e.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
  if (document.querySelector('[role="dialog"]')) return
  e.preventDefault()
  focusInput()
})

defineExpose({ focus: focusInput })
</script>

<template>
  <div class="relative mt-8 w-full max-w-xl">
    <form
      class="glass flex items-center gap-1 rounded-full py-1.5 pr-1.5 pl-2.5"
      @submit.prevent="go()"
    >
      <Popover v-model:open="enginePickerOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="shrink-0 rounded-full transition-transform hover:scale-105 active:scale-95"
            :title="`当前引擎：${engine.name}（Tab 切换）`"
          >
            <SearchEngineIcon :engine="engine" size="size-8" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" :side-offset="8" class="w-56 rounded-xl p-1.5">
          <button
            v-for="e in store.searchEngines"
            :key="e.id"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-foreground/5"
            @click="pickEngine(e.id)"
          >
            <SearchEngineIcon :engine="e" size="size-6" />
            <span class="flex-1 truncate">{{ e.name }}</span>
            <span v-if="e.id === store.currentEngineId" class="text-xs text-muted-foreground">当前</span>
          </button>
        </PopoverContent>
      </Popover>

      <input
        ref="inputEl"
        v-model="keyword"
        type="text"
        class="page-text h-10 w-full bg-transparent px-2 text-white placeholder-white/60 outline-none"
        placeholder="搜索"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @input="onInput"
        @keydown="onKeydown"
      />

      <button
        type="submit"
        class="flex size-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
        title="搜索（Enter）"
      >
        <Search class="size-5" />
      </button>
    </form>

    <Transition name="pop">
      <ul
        v-if="showSuggestions"
        class="glass-strong absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl py-1.5"
      >
        <li
          v-for="(s, i) in suggestions"
          :key="s"
          class="page-text cursor-pointer px-5 py-2 text-sm text-white/90"
          :class="i === activeIndex ? 'bg-white/15' : ''"
          @mouseenter="activeIndex = i"
          @click="go(s)"
        >
          {{ s }}
        </li>
      </ul>
    </Transition>
  </div>
</template>
