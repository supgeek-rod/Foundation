import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DEFAULT_GROUPS } from '@/constants/defaultGroups'
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings'
import { BUILTIN_SEARCH_ENGINES, DEFAULT_ENGINE_ID } from '@/constants/searchEngines'
import type { BackgroundSettings, LocationSetting, Settings } from '@/types/settings'
import type { SearchEngine } from '@/types/search'
import type { ShortcutGroup } from '@/types/shortcut'
import { uid } from '@/utils/id'
import { useShortcutsStore } from '@/stores/shortcuts'

export interface ExportPayload {
  version: number
  exportedAt: string
  settings: Settings
  searchEngines: SearchEngine[]
  currentEngineId: string
  groups: ShortcutGroup[]
}

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const settings = ref<Settings>({
      ...DEFAULT_SETTINGS,
      background: { ...DEFAULT_SETTINGS.background },
      location: { ...DEFAULT_SETTINGS.location },
    })
    const searchEngines = ref<SearchEngine[]>(structuredClone(BUILTIN_SEARCH_ENGINES))
    const currentEngineId = ref(DEFAULT_ENGINE_ID)

    const currentEngine = computed(
      () => searchEngines.value.find((e) => e.id === currentEngineId.value) ?? searchEngines.value[0]!,
    )

    function updateSettings(partial: Partial<Settings>) {
      Object.assign(settings.value, partial)
    }
    function updateBackground(partial: Partial<BackgroundSettings>) {
      Object.assign(settings.value.background, partial)
    }
    function updateLocation(partial: Partial<LocationSetting>) {
      Object.assign(settings.value.location, partial)
    }

    function addEngine(engine: Omit<SearchEngine, 'id'>) {
      searchEngines.value.push({ ...engine, id: uid() })
    }
    function updateEngine(id: string, partial: Partial<Omit<SearchEngine, 'id'>>) {
      const engine = searchEngines.value.find((e) => e.id === id)
      if (engine) Object.assign(engine, partial)
    }
    /** 内置引擎不可删除；删除当前引擎时回到默认 */
    function removeEngine(id: string): boolean {
      const engine = searchEngines.value.find((e) => e.id === id)
      if (!engine || engine.builtin) return false
      searchEngines.value = searchEngines.value.filter((e) => e.id !== id)
      if (currentEngineId.value === id) currentEngineId.value = DEFAULT_ENGINE_ID
      return true
    }
    function resetEngines() {
      searchEngines.value = structuredClone(BUILTIN_SEARCH_ENGINES)
      currentEngineId.value = DEFAULT_ENGINE_ID
    }

    function exportData(): string {
      const shortcuts = useShortcutsStore()
      const payload: ExportPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: settings.value,
        searchEngines: searchEngines.value,
        currentEngineId: currentEngineId.value,
        groups: shortcuts.groups,
      }
      return JSON.stringify(payload, null, 2)
    }

    function importData(json: string): { ok: boolean; message: string } {
      try {
        const data = JSON.parse(json) as Partial<ExportPayload>
        if (data.settings) {
          settings.value = {
            ...DEFAULT_SETTINGS,
            ...data.settings,
            background: { ...DEFAULT_SETTINGS.background, ...data.settings.background },
            location: { ...DEFAULT_SETTINGS.location, ...data.settings.location },
          }
        }
        if (Array.isArray(data.searchEngines) && data.searchEngines.length > 0) {
          searchEngines.value = data.searchEngines
        }
        if (data.currentEngineId) currentEngineId.value = data.currentEngineId
        if (Array.isArray(data.groups)) {
          useShortcutsStore().groups = data.groups
        }
        return { ok: true, message: '导入成功' }
      } catch {
        return { ok: false, message: '文件格式不正确，导入失败' }
      }
    }

    function resetAll() {
      settings.value = {
        ...DEFAULT_SETTINGS,
        background: { ...DEFAULT_SETTINGS.background },
        location: { ...DEFAULT_SETTINGS.location },
      }
      resetEngines()
      useShortcutsStore().groups = structuredClone(DEFAULT_GROUPS)
    }

    return {
      settings,
      searchEngines,
      currentEngineId,
      currentEngine,
      updateSettings,
      updateBackground,
      updateLocation,
      addEngine,
      updateEngine,
      removeEngine,
      resetEngines,
      exportData,
      importData,
      resetAll,
    }
  },
  { persist: true },
)
