import type { WeatherData } from '@/types/weather'
import { readCache, writeCache } from '@/utils/cache'

const CACHE_KEY = 'weather:current'
const CACHE_TTL = 30 * 60 * 1000

interface OpenMeteoResponse {
  current_weather: {
    temperature: number
    windspeed: number
    winddirection: number
    weathercode: number
    is_day: number
    time: string
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

/** Open-Meteo 实时天气 + 今日温度区间 */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitude}&longitude=${longitude}` +
    '&current_weather=true&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto'
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`天气请求失败：HTTP ${res.status}`)
  const json = (await res.json()) as OpenMeteoResponse
  const cw = json.current_weather
  return {
    temperature: Math.round(cw.temperature),
    min: Math.round(json.daily.temperature_2m_min[0] ?? cw.temperature),
    max: Math.round(json.daily.temperature_2m_max[0] ?? cw.temperature),
    code: cw.weathercode,
    windSpeed: cw.windspeed,
    windDirection: cw.winddirection,
    isDay: cw.is_day === 1,
  }
}

/** 30 分钟内、同一位置附近的天气缓存 */
export function getCachedWeather(latitude: number, longitude: number): WeatherData | null {
  const cached = readCache<{ latitude: number; longitude: number; weather: WeatherData }>(CACHE_KEY, CACHE_TTL)
  if (!cached) return null
  const near =
    Math.abs(cached.data.latitude - latitude) < 0.5 && Math.abs(cached.data.longitude - longitude) < 0.5
  return near ? cached.data.weather : null
}

export function setCachedWeather(latitude: number, longitude: number, weather: WeatherData): void {
  writeCache(CACHE_KEY, { latitude, longitude, weather })
}
