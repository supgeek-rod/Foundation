export interface GeoLocation {
  name: string
  latitude: number
  longitude: number
}

export interface WeatherData {
  /** 当前温度 ℃ */
  temperature: number
  /** 今日最低温 ℃ */
  min: number
  /** 今日最高温 ℃ */
  max: number
  /** WMO 天气码 */
  code: number
  /** 风速 km/h */
  windSpeed: number
  /** 风向角度 */
  windDirection: number
  isDay: boolean
}
