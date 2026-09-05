<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import SettingRow from '@/components/SettingRow.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { searchCity, type CityResult } from '@/services/geocodingApi'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()

// 手动城市搜索
const cityQuery = ref('')
const cityResults = ref<CityResult[]>([])
const searching = ref(false)

async function search() {
  const q = cityQuery.value.trim()
  if (!q) return
  searching.value = true
  try {
    cityResults.value = await searchCity(q)
    if (cityResults.value.length === 0) toast.info('未找到该城市')
  } catch {
    toast.error('城市搜索失败，请稍后重试')
  } finally {
    searching.value = false
  }
}

function pickCity(result: CityResult) {
  store.updateLocation({
    mode: 'manual',
    city: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
  })
  cityResults.value = []
  cityQuery.value = result.name
  toast.success(`已切换到 ${result.name}`)
}

function useAutoLocation() {
  store.updateLocation({ mode: 'auto', city: undefined, latitude: undefined, longitude: undefined })
  toast.success('已恢复自动定位，稍后自动刷新天气')
}
</script>

<template>
  <div class="space-y-3">
    <SettingRow title="主题模式" desc="浅色、深色或跟随系统">
      <Select
        :model-value="store.settings.theme"
        @update:model-value="(v) => store.updateSettings({ theme: v as 'system' | 'light' | 'dark' })"
      >
        <SelectTrigger class="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">跟随系统</SelectItem>
          <SelectItem value="light">浅色</SelectItem>
          <SelectItem value="dark">深色</SelectItem>
        </SelectContent>
      </Select>
    </SettingRow>

    <SettingRow title="新链接打开方式" desc="配置全局链接跳转方式">
      <Select
        :model-value="store.settings.openLinkInNewTab ? 'new' : 'current'"
        @update:model-value="(v) => store.updateSettings({ openLinkInNewTab: v === 'new' })"
      >
        <SelectTrigger class="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">新标签页打开</SelectItem>
          <SelectItem value="current">当前页打开</SelectItem>
        </SelectContent>
      </Select>
    </SettingRow>

    <SettingRow title="随机一言" desc="在主页下方空白处随机显示一句格言或诗词">
      <Switch
        :checked="store.settings.showQuote"
        @update:checked="(v: boolean) => store.updateSettings({ showQuote: v })"
      />
    </SettingRow>

    <SettingRow title="显示天气" desc="控制是否在时间下方显示天气信息">
      <Switch
        :checked="store.settings.showWeather"
        @update:checked="(v: boolean) => store.updateSettings({ showWeather: v })"
      />
    </SettingRow>

    <SettingRow title="显示完整日期" desc="控制是否显示主页月份和日期">
      <Switch
        :checked="store.settings.showFullDate"
        @update:checked="(v: boolean) => store.updateSettings({ showFullDate: v })"
      />
    </SettingRow>

    <SettingRow title="显示快捷方式" desc="控制是否在主页显示快捷方式分组">
      <Switch
        :checked="store.settings.showShortcuts"
        @update:checked="(v: boolean) => store.updateSettings({ showShortcuts: v })"
      />
    </SettingRow>

    <SettingRow
      title="城市定位"
      :desc="
        store.settings.location.mode === 'manual' && store.settings.location.city
          ? `当前手动指定：${store.settings.location.city}`
          : '自动定位：浏览器定位，失败时回退 IP 定位'
      "
    >
      <Button variant="outline" size="sm" @click="useAutoLocation">
        {{ store.settings.location.mode === 'manual' ? '恢复自动定位' : '自动定位中' }}
      </Button>
    </SettingRow>

    <div class="rounded-xl bg-muted/70 p-4">
      <div class="mb-2 text-sm font-medium">手动指定城市</div>
      <div class="flex gap-2">
        <Input v-model="cityQuery" placeholder="输入城市名，如：赣州" @keydown.enter="search" />
        <Button :disabled="searching" @click="search">
          {{ searching ? '搜索中…' : '搜索' }}
        </Button>
      </div>
      <ul v-if="cityResults.length > 0" class="mt-2 max-h-44 space-y-0.5 overflow-y-auto">
        <li v-for="r in cityResults" :key="`${r.latitude},${r.longitude}`">
          <button
            type="button"
            class="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-foreground/5"
            @click="pickCity(r)"
          >
            {{ r.name }}
            <span class="text-xs text-muted-foreground">
              {{ [r.admin1, r.country].filter(Boolean).join(' · ') }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
