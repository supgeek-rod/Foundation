<script setup lang="ts">
import { ImagePlus, RefreshCw, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import SettingRow from '@/components/SettingRow.vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useBackground } from '@/composables/useBackground'
import { useSettingsStore } from '@/stores/settings'
import type { BackgroundSource } from '@/types/settings'

const store = useSettingsStore()
const { bingFailed, loadBing, setCustomImage, clearCustomImage, refreshPicsum } = useBackground()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const SOURCE_OPTIONS: Array<{ value: BackgroundSource; label: string }> = [
  { value: 'gradient', label: '内置渐变' },
  { value: 'bing', label: '必应每日壁纸' },
  { value: 'picsum', label: '随机图库' },
  { value: 'custom', label: '本地上传' },
]

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  try {
    await setCustomImage(file)
    toast.success('背景已更新')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '上传失败')
  } finally {
    uploading.value = false
  }
}

async function refreshBing() {
  await loadBing(true)
  if (bingFailed.value) toast.error('必应壁纸获取失败，请检查网络')
  else toast.success('已更新为今日必应壁纸')
}

function removeCustom() {
  void clearCustomImage()
  store.updateBackground({ source: 'gradient' })
  toast.success('已清除自定义背景')
}
</script>

<template>
  <div class="space-y-3">
    <SettingRow title="图片来源" desc="渐变无需联网；必应每日与图库依赖网络">
      <Select
        :model-value="store.settings.background.source"
        @update:model-value="(v) => store.updateBackground({ source: v as BackgroundSource })"
      >
        <SelectTrigger class="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in SOURCE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </SettingRow>

    <SettingRow
      v-if="store.settings.background.source === 'bing'"
      title="必应每日壁纸"
      desc="按天缓存；获取失败会自动回退渐变背景"
    >
      <Button variant="outline" size="sm" @click="refreshBing">
        <RefreshCw class="size-4" /> 重新获取
      </Button>
    </SettingRow>

    <SettingRow v-if="store.settings.background.source === 'picsum'" title="随机图库" desc="来自 picsum.photos 的随机风景图">
      <Button variant="outline" size="sm" @click="refreshPicsum">
        <RefreshCw class="size-4" /> 换一张
      </Button>
    </SettingRow>

    <SettingRow v-if="store.settings.background.source === 'custom'" title="本地上传" desc="图片保存在浏览器本地（IndexedDB），不超过 15MB">
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="uploading" @click="fileInput?.click()">
          <ImagePlus class="size-4" /> {{ uploading ? '上传中…' : '选择图片' }}
        </Button>
        <Button variant="outline" size="sm" @click="removeCustom">
          <Trash2 class="size-4" /> 清除
        </Button>
      </div>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
    </SettingRow>

    <SettingRow title="遮罩强度" desc="深色模式压暗背景、浅色模式柔化背景，提升文字可读性">
      <div class="flex w-44 items-center gap-3">
        <Slider
          :model-value="[store.settings.background.dim]"
          :min="0"
          :max="80"
          :step="5"
          @update:model-value="(v) => store.updateBackground({ dim: Array.isArray(v) ? (v[0] ?? 0) : v })"
        />
        <span class="w-10 text-right text-xs text-muted-foreground">{{ store.settings.background.dim }}%</span>
      </div>
    </SettingRow>

    <SettingRow title="背景模糊" desc="对背景图应用高斯模糊">
      <div class="flex w-44 items-center gap-3">
        <Slider
          :model-value="[store.settings.background.blur]"
          :min="0"
          :max="30"
          :step="1"
          @update:model-value="(v) => store.updateBackground({ blur: Array.isArray(v) ? (v[0] ?? 0) : v })"
        />
        <span class="w-10 text-right text-xs text-muted-foreground">{{ store.settings.background.blur }}px</span>
      </div>
    </SettingRow>
  </div>
</template>
