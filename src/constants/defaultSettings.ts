import type { Settings } from '@/types/settings'

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  openLinkInNewTab: true,
  showQuote: true,
  showWeather: true,
  showFullDate: true,
  showShortcuts: true,
  background: { source: 'gradient', blur: 0, dim: 25 },
  location: { mode: 'auto' },
}

/** 无一言数据时的兜底文案 */
export const FALLBACK_QUOTE = { text: '自信起来，你能做到任何事。', from: '' }
