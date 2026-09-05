import { normalizeUrl } from '@/utils/format'

/** 通过 favicon.im 抓取站点图标 */
export function faviconUrl(siteUrl: string): string {
  try {
    const { hostname } = new URL(normalizeUrl(siteUrl))
    return `https://favicon.im/${hostname}?larger=true`
  } catch {
    return ''
  }
}
