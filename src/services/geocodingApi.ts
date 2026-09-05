export interface CityResult {
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
}

/** Open-Meteo 城市搜索（中文） */
export async function searchCity(keyword: string): Promise<CityResult[]> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(keyword)}` +
    '&count=8&language=zh&format=json'
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`城市搜索失败：HTTP ${res.status}`)
  const json = (await res.json()) as { results?: CityResult[] }
  return json.results ?? []
}

/** 逆地理编码：坐标 → 城市名（BigDataCloud 免费客户端接口） */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}` +
    `&longitude=${longitude}&localityLanguage=zh`
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
  if (!res.ok) return ''
  const json = (await res.json()) as {
    city?: string
    locality?: string
    principalSubdivision?: string
  }
  return json.city || json.locality || json.principalSubdivision || ''
}
