import { ref } from 'vue'
import { FALLBACK_QUOTE } from '@/constants/defaultSettings'
import { fetchQuote, type Quote } from '@/services/hitokotoApi'

// 模块级共享状态：切换组件不重复请求
const quote = ref<Quote>(FALLBACK_QUOTE)
const loading = ref(false)
let requested = false

export function useQuote() {
  async function refresh() {
    if (loading.value) return
    loading.value = true
    try {
      quote.value = await fetchQuote()
    } catch {
      quote.value = FALLBACK_QUOTE
    } finally {
      loading.value = false
    }
  }

  if (!requested) {
    requested = true
    refresh()
  }

  return { quote, loading, refresh }
}
