<script setup lang="ts">
import { computed } from 'vue'
import { weatherCodeInfo } from '@/constants/weatherCodes'
import { useWeather } from '@/composables/useWeather'
import { useSettingsStore } from '@/stores/settings'
import { windDirectionText, windLevelText } from '@/utils/format'

const store = useSettingsStore()
const { weather, cityName, failed } = useWeather()

const info = computed(() =>
  weather.value ? weatherCodeInfo(weather.value.code) : null,
)

const weatherText = computed(() => {
  if (!weather.value) return ''
  const w = weather.value
  const parts = [
    info.value?.text,
    `${w.min}℃~${w.max}℃`,
    `${windDirectionText(w.windDirection)} ${windLevelText(w.windSpeed)}`,
  ]
  return parts.filter(Boolean).join('  ')
})
</script>

<template>
  <div
    v-if="store.settings.showWeather && weather && !failed"
    class="page-text mt-2 flex items-center gap-2 text-sm text-white/90 md:text-base"
  >
    <span>{{ cityName }}</span>
    <component :is="info!.icon" class="size-4" />
    <span>{{ weatherText }}</span>
  </div>
</template>
