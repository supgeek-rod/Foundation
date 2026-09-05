const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** 「9月5日」 */
export function formatDateCN(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 「周六」 */
export function weekdayCN(d: Date): string {
  return `周${WEEKDAYS[d.getDay()]}`
}

/** 风向角度 → 「西北风」 */
export function windDirectionText(deg: number): string {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  return `${dirs[Math.round(deg / 45) % 8]}风`
}

/** km/h → 蒲福风级「3级」 */
export function windLevelText(kmh: number): string {
  const thresholds = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 117]
  let level = 0
  for (let i = 0; i < thresholds.length; i++) {
    if (kmh >= thresholds[i]) level = i + 1
  }
  return `${level}级`
}

/** 补全协议头 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** 是否像一个可直接跳转的网址（而非搜索词） */
export function isLikelyUrl(text: string): boolean {
  const t = text.trim()
  if (!t || /\s/.test(t)) return false
  return /^https?:\/\//i.test(t) || (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(t) && /\./.test(t))
}
