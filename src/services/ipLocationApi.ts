import type { GeoLocation } from '@/types/weather'

/** IP 定位兜底（浏览器定位被拒或不可用时），失败返回 null */
export async function ipLocate(): Promise<GeoLocation | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const json = (await res.json()) as {
      error?: boolean
      city?: string
      latitude?: number
      longitude?: number
    }
    if (json.error || typeof json.latitude !== 'number' || typeof json.longitude !== 'number') {
      return null
    }
    return { name: json.city ?? '', latitude: json.latitude, longitude: json.longitude }
  } catch {
    return null
  }
}
