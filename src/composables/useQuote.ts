import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'
import { ref, watch } from 'vue'
import { FALLBACK_QUOTE } from '@/constants/defaultSettings'
import { fetchQuote, type Quote } from '@/services/hitokotoApi'

const REFRESH_INTERVAL = 60 * 1000

// 模块级共享状态：切换组件不重复请求
const quote = ref<Quote>(FALLBACK_QUOTE)
const loading = ref(false)
let requested = false
/** 上次刷新的墙钟时间，用于「离开超一分钟返回立即刷新」判断 */
let lastRefreshAt = 0
/** 页面可见期间的累计秒数（不可见时不计时） */
let visibleSeconds = 0

export function useQuote() {
  const visibility = useDocumentVisibility()

  async function refresh() {
    if (loading.value) return
    loading.value = true
    lastRefreshAt = Date.now()
    visibleSeconds = 0
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

    // 正在浏览页面：每分钟换一句；页面不可见：跳过计时（浏览器对后台标签的定时器节流也不影响逻辑）
    useIntervalFn(() => {
      if (visibility.value !== 'visible') return
      visibleSeconds += 1
      if (visibleSeconds >= 60) void refresh()
    }, 1000)

    // 离开页面超过一分钟再回来：立即换一句
    watch(visibility, (state) => {
      if (state === 'visible' && Date.now() - lastRefreshAt >= REFRESH_INTERVAL) void refresh()
    })

    void refresh()
  }

  return { quote, loading, refresh }
}
