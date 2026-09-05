import { usePreferredDark, useDark } from '@vueuse/core'
import { watchEffect } from 'vue'
import { useSettingsStore } from '@/stores/settings'

/**
 * 主题切换：设置值 system 跟随系统，light/dark 手动锁定。
 * 持久化由 settings store 负责，这里不再单独存储。
 */
export function useTheme() {
  const store = useSettingsStore()
  const isDark = useDark({ storageKey: null })
  const prefersDark = usePreferredDark()

  watchEffect(() => {
    const mode = store.settings.theme
    isDark.value = mode === 'dark' || (mode === 'system' && prefersDark.value)
  })

  return { isDark }
}
