export interface Quote {
  text: string
  from: string
}

/** 一言 API 随机语句 */
export async function fetchQuote(): Promise<Quote> {
  const res = await fetch('https://v1.hitokoto.cn/?max_length=30', {
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`一言请求失败：HTTP ${res.status}`)
  const json = (await res.json()) as { hitokoto: string; from?: string | null }
  return { text: json.hitokoto, from: json.from ?? '' }
}
