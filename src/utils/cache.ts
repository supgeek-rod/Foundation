interface CacheEntry<T> {
  data: T
  timestamp: number
}

/** 读取带 TTL 的 localStorage 缓存，过期或损坏返回 null */
export function readCache<T>(key: string, ttl: number): { data: T; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<T>
    if (typeof parsed.timestamp !== 'number' || Date.now() - parsed.timestamp > ttl) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // 存储已满等异常静默忽略
  }
}
