<script setup lang="ts">
import { Download, RotateCcw, Upload } from '@lucide/vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import SettingRow from '@/components/SettingRow.vue'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings'

const store = useSettingsStore()
const fileInput = ref<HTMLInputElement | null>(null)

function exportConfig() {
  const data = store.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  a.href = url
  a.download = `homepage-config-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('配置已导出')
}

async function importConfig(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const text = await file.text()
    const result = store.importData(text)
    if (result.ok) toast.success(result.message)
    else toast.error(result.message)
  } catch {
    toast.error('读取文件失败')
  }
}

function resetAll() {
  store.resetAll()
  toast.success('已恢复默认配置')
}
</script>

<template>
  <div class="space-y-3">
    <SettingRow title="导出配置" desc="包含设置、搜索引擎与全部分组，生成 JSON 文件">
      <Button variant="outline" size="sm" @click="exportConfig">
        <Download class="size-4" /> 导出
      </Button>
    </SettingRow>

    <SettingRow title="导入配置" desc="从导出的 JSON 文件恢复配置">
      <Button variant="outline" size="sm" @click="fileInput?.click()">
        <Upload class="size-4" /> 导入
      </Button>
      <input ref="fileInput" type="file" accept=".json,application/json" class="hidden" @change="importConfig" />
    </SettingRow>

    <SettingRow title="恢复默认" desc="清空全部设置、自定义引擎与分组，恢复初始状态">
      <Button variant="destructive" size="sm" @click="resetAll">
        <RotateCcw class="size-4" /> 恢复默认
      </Button>
    </SettingRow>

    <p class="pt-1 text-xs text-muted-foreground">
      所有数据仅保存在本浏览器中（localStorage 与 IndexedDB），不会上传到任何服务器；更换浏览器或清除数据前请先导出备份。
    </p>
  </div>
</template>
