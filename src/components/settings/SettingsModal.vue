<script setup lang="ts">
import { CircleHelp, Database, Globe, Image, Info, LayoutGrid, Settings } from '@lucide/vue'
import { computed, ref, type Component } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettingsModal } from '@/composables/useSettingsModal'
import AboutSettings from './AboutSettings.vue'
import BackgroundSettings from './BackgroundSettings.vue'
import BackupSettings from './BackupSettings.vue'
import BasicSettings from './BasicSettings.vue'
import GroupSettings from './GroupSettings.vue'
import HelpSettings from './HelpSettings.vue'
import SearchEngineSettings from './SearchEngineSettings.vue'

interface TabItem {
  value: string
  label: string
  icon: Component
  panel: Component
}

const TABS: TabItem[] = [
  { value: 'basic', label: '基本设置', icon: Settings, panel: BasicSettings },
  { value: 'engine', label: '搜索引擎', icon: Globe, panel: SearchEngineSettings },
  { value: 'group', label: '分组管理', icon: LayoutGrid, panel: GroupSettings },
  { value: 'background', label: '背景图片', icon: Image, panel: BackgroundSettings },
  { value: 'backup', label: '数据备份', icon: Database, panel: BackupSettings },
  { value: 'help', label: '帮助和反馈', icon: CircleHelp, panel: HelpSettings },
  { value: 'about', label: '关于', icon: Info, panel: AboutSettings },
]

const { open, hide } = useSettingsModal()
const active = ref('basic')
const activeLabel = computed(() => TABS.find((t) => t.value === active.value)?.label ?? '')
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !v && hide()">
    <DialogContent
      class="glass-strong top-[50%] flex h-[min(88dvh,42rem)] w-[min(94vw,56rem)] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden p-0 sm:max-w-[56rem]"
      :show-close-button="true"
    >
      <DialogTitle class="sr-only">设置</DialogTitle>
      <DialogDescription class="sr-only">个性化与全局设置</DialogDescription>

      <Tabs v-model="active" orientation="vertical" class="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside
          class="border-b border-border/40 bg-black/[0.03] p-5 md:border-r md:border-b-0 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div class="hidden md:block">
            <h2 class="px-2 text-xl font-bold">设置</h2>
            <p class="mb-4 px-2 text-xs text-muted-foreground">个性化与全局设置</p>
          </div>
          <TabsList class="flex h-auto w-full items-stretch gap-1 overflow-x-auto bg-transparent p-0 md:flex-col">
            <TabsTrigger
              v-for="tab in TABS"
              :key="tab.value"
              :value="tab.value"
              class="w-full justify-start gap-2.5 self-start whitespace-nowrap px-3 py-2 text-sm data-[state=active]:bg-card data-[state=active]:font-medium data-[state=active]:shadow-sm"
            >
              <component :is="tab.icon" class="size-4" />
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
        </aside>

        <main class="min-h-0 overflow-hidden">
          <ScrollArea class="h-full">
            <div class="p-6">
              <div class="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Settings class="size-3.5" />
                <span>设置</span>
                <span class="opacity-50">/</span>
                <span class="font-medium text-foreground">{{ activeLabel }}</span>
              </div>
              <TabsContent v-for="tab in TABS" :key="tab.value" :value="tab.value" class="mt-0">
                <h3 class="mb-4 border-l-4 border-foreground pl-2.5 text-lg font-bold">
                  {{ tab.label }}
                </h3>
                <component :is="tab.panel" />
              </TabsContent>
            </div>
          </ScrollArea>
        </main>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
