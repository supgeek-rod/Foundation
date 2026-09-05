export interface Wallpaper {
  url: string
  title: string
}

const CACHE_KEY = 'wallpaper:bing'

/** 官方接口无 CORS 头，浏览器内依次尝试直连与公共代理 */
const PROXIES = [
  (target: string) => target,
  (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  (target: string) => `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
]

interface BingArchive {
  images?: Array<{ startdate?: string; url?: string; copyright?: string }>
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/**
 * 必应每日壁纸。结果按天缓存；全部来源失败返回 null（调用方回退渐变背景）。
 */
export async function getDailyWallpaper(force = false): Promise<Wallpaper | null> {
  if (!force) {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw) as { date: string; wallpaper: Wallpaper }
        if (cached.date === todayKey() && cached.wallpaper?.url) return cached.wallpaper
      }
    } catch {
      // 缓存损坏则继续拉取
    }
  }

  const target = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
  for (const wrap of PROXIES) {
    try {
      const res = await fetch(wrap(target), { signal: AbortSignal.timeout(6000) })
      if (!res.ok) continue
      const json = (await res.json()) as BingArchive
      const img = json.images?.[0]
      if (!img?.url) continue
      const wallpaper: Wallpaper = {
        url: `https://cn.bing.com${img.url.split('&rf=')[0]}`,
        title: img.copyright ?? '',
      }
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayKey(), wallpaper }))
      } catch {
        // 忽略存储异常
      }
      return wallpaper
    } catch {
      // 尝试下一个来源
    }
  }
  return null
}
