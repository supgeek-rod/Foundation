export type ThemeMode = 'system' | 'light' | 'dark'

/** 背景图来源：内置渐变 / 必应每日 / 随机图库 / 本地上传 */
export type BackgroundSource = 'gradient' | 'bing' | 'picsum' | 'custom'

export interface BackgroundSettings {
  source: BackgroundSource
  /** 背景模糊半径 px，0-30 */
  blur: number
  /** 暗色遮罩百分比，0-80 */
  dim: number
}

export interface LocationSetting {
  /** auto：自动定位；manual：使用手动指定城市 */
  mode: 'auto' | 'manual'
  city?: string
  latitude?: number
  longitude?: number
}

export interface Settings {
  theme: ThemeMode
  /** 新链接是否在新标签页打开 */
  openLinkInNewTab: boolean
  /** 底部随机一言 */
  showQuote: boolean
  /** 时间下方天气信息 */
  showWeather: boolean
  /** 完整日期（月份和日期） */
  showFullDate: boolean
  /** 主页快捷方式分组 */
  showShortcuts: boolean
  background: BackgroundSettings
  location: LocationSetting
}
