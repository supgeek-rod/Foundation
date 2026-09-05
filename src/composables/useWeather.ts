import { ref, watch } from 'vue'
import { reverseGeocode } from '@/services/geocodingApi'
import { ipLocate } from '@/services/ipLocationApi'
import { fetchWeather, getCachedWeather, setCachedWeather } from '@/services/weatherApi'
import type { GeoLocation, WeatherData } from '@/types/weather'
import { readCache, writeCache } from '@/utils/cache'
import { useSettingsStore } from '@/stores/settings'

const DEFAULT_LOCATION: GeoLocation = { name: '北京', latitude: 39.9042, longitude: 116.4074 }
const LOCATION_CACHE_KEY = 'weather:location'
const LOCATION_CACHE_TTL = 24 * 60 * 60 * 1000

// 模块级共享状态：全页单例
const weather = ref<WeatherData | null>(null)
const cityName = ref('')
const loading = ref(false)
const failed = ref(false)
let started = false

function getBrowserLocation(): Promise<GeoLocation | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const name = await reverseGeocode(latitude, longitude).catch(() => '')
        resolve({ name, latitude, longitude })
      },
      () => resolve(null),
      { timeout: 6000, maximumAge: 10 * 60 * 1000 },
    )
  })
}

/** 定位链：手动指定 → 缓存 → 浏览器定位 → IP 定位 → 默认城市 */
async function resolveLocation(mode: 'auto' | 'manual', city: string | undefined, latitude: number | undefined, longitude: number | undefined): Promise<GeoLocation> {
  if (mode === 'manual' && latitude != null && longitude != null) {
    return { name: city ?? '', latitude, longitude }
  }
  const cached = readCache<GeoLocation>(LOCATION_CACHE_KEY, LOCATION_CACHE_TTL)
  if (cached) return cached.data
  const located = (await getBrowserLocation()) ?? (await ipLocate()) ?? DEFAULT_LOCATION
  if (located !== DEFAULT_LOCATION) writeCache(LOCATION_CACHE_KEY, located)
  return located
}

export function useWeather() {
  const store = useSettingsStore()

  async function refresh() {
    if (loading.value) return
    loading.value = true
    try {
      const { mode, city, latitude, longitude } = store.settings.location
      const loc = await resolveLocation(mode, city, latitude, longitude)
      cityName.value = loc.name || '未知'
      const cached = getCachedWeather(loc.latitude, loc.longitude)
      weather.value = cached ?? (await fetchWeather(loc.latitude, loc.longitude))
      if (!cached) setCachedWeather(loc.latitude, loc.longitude, weather.value)
      failed.value = false
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  if (!started) {
    started = true
    refresh()
  }

  // 手动切换城市后立即刷新
  watch(
    () => [store.settings.location.mode, store.settings.location.city, store.settings.location.latitude],
    () => refresh(),
  )

  return { weather, cityName, loading, failed, refresh }
}
