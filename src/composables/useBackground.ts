import { del, get, set } from 'idb-keyval'
import { computed, ref } from 'vue'
import { getDailyWallpaper, type Wallpaper } from '@/services/wallpaperApi'
import { useSettingsStore } from '@/stores/settings'

const CUSTOM_BG_KEY = 'background:custom'

// 模块级共享状态
const bingWallpaper = ref<Wallpaper | null>(null)
const bingFailed = ref(false)
const customUrl = ref('')
const picsumUrl = ref(`https://picsum.photos/1920/1080?random=${Date.now()}`)
let bingRequested = false
let customRequested = false

export function useBackground() {
  const store = useSettingsStore()
  const source = computed(() => store.settings.background.source)

  async function loadBing(force = false) {
    bingWallpaper.value = await getDailyWallpaper(force)
    bingFailed.value = !bingWallpaper.value
  }

  async function loadCustom() {
    if (customRequested) return
    customRequested = true
    try {
      const blob = await get<Blob>(CUSTOM_BG_KEY)
      if (blob) customUrl.value = URL.createObjectURL(blob)
    } catch {
      // IndexedDB 不可用时保持无自定义背景
    }
  }

  async function setCustomImage(file: File) {
    if (!file.type.startsWith('image/')) throw new Error('请选择图片文件')
    if (file.size > 15 * 1024 * 1024) throw new Error('图片大小不能超过 15MB')
    await set(CUSTOM_BG_KEY, file)
    if (customUrl.value) URL.revokeObjectURL(customUrl.value)
    customUrl.value = URL.createObjectURL(file)
    store.updateBackground({ source: 'custom' })
  }

  async function clearCustomImage() {
    await del(CUSTOM_BG_KEY).catch(() => {})
    if (customUrl.value) {
      URL.revokeObjectURL(customUrl.value)
      customUrl.value = ''
    }
    customRequested = false
  }

  function refreshPicsum() {
    picsumUrl.value = `https://picsum.photos/1920/1080?random=${Date.now()}`
  }

  /** 需要时懒加载对应来源的数据 */
  function ensureLoaded() {
    if (source.value === 'bing' && !bingRequested) {
      bingRequested = true
      loadBing()
    }
    if (source.value === 'custom') void loadCustom()
  }

  const imageUrl = computed(() => {
    switch (source.value) {
      case 'bing':
        return bingWallpaper.value?.url ?? ''
      case 'picsum':
        return picsumUrl.value
      case 'custom':
        return customUrl.value
      default:
        return ''
    }
  })

  return {
    source,
    imageUrl,
    bingFailed,
    blur: computed(() => store.settings.background.blur),
    dim: computed(() => store.settings.background.dim),
    loadBing,
    ensureLoaded,
    setCustomImage,
    clearCustomImage,
    refreshPicsum,
  }
}
