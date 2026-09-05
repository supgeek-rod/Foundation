import { jsonp } from '@/utils/jsonp'

interface BaiduSuggestion {
  q: string
  p: boolean
  s?: string[]
}

/** 百度搜索联想词（JSONP，无 CORS 限制），失败抛出由调用方静默处理 */
export async function fetchSuggestions(keyword: string): Promise<string[]> {
  const url = `https://www.baidu.com/su?wd=${encodeURIComponent(keyword)}`
  const data = await jsonp<BaiduSuggestion>(url, { timeout: 4000 })
  return Array.isArray(data?.s) ? data.s.slice(0, 8) : []
}
