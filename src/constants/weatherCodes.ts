import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Sun,
} from '@lucide/vue'
import type { Component } from 'vue'

export interface WeatherCodeInfo {
  /** 中文天气现象 */
  text: string
  icon: Component
}

/** WMO weather code → 中文描述 + 图标 */
export const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { text: '晴', icon: Sun },
  1: { text: '晴', icon: Sun },
  2: { text: '多云', icon: CloudSun },
  3: { text: '阴', icon: Cloud },
  45: { text: '雾', icon: CloudFog },
  48: { text: '雾凇', icon: CloudFog },
  51: { text: '小毛毛雨', icon: CloudDrizzle },
  53: { text: '毛毛雨', icon: CloudDrizzle },
  55: { text: '大毛毛雨', icon: CloudDrizzle },
  56: { text: '冻毛毛雨', icon: CloudDrizzle },
  57: { text: '强冻毛毛雨', icon: CloudDrizzle },
  61: { text: '小雨', icon: CloudRain },
  63: { text: '中雨', icon: CloudRain },
  65: { text: '大雨', icon: CloudRain },
  66: { text: '冻雨', icon: CloudRainWind },
  67: { text: '强冻雨', icon: CloudRainWind },
  71: { text: '小雪', icon: CloudSnow },
  73: { text: '中雪', icon: CloudSnow },
  75: { text: '大雪', icon: CloudSnow },
  77: { text: '雪粒', icon: CloudSnow },
  80: { text: '小阵雨', icon: CloudRain },
  81: { text: '阵雨', icon: CloudRain },
  82: { text: '强阵雨', icon: CloudRain },
  85: { text: '阵雪', icon: CloudSnow },
  86: { text: '强阵雪', icon: CloudSnow },
  95: { text: '雷阵雨', icon: CloudLightning },
  96: { text: '雷阵雨伴冰雹', icon: CloudHail },
  99: { text: '雷阵雨伴冰雹', icon: CloudHail },
}

export function weatherCodeInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? { text: '未知', icon: Cloud }
}
