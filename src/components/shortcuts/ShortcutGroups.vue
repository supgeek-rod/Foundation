<script setup lang="ts">
import draggable from 'vuedraggable'
import { ExternalLink, Pencil, Plus, SquarePen, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useSettingsStore } from '@/stores/settings'
import { useShortcutsStore } from '@/stores/shortcuts'
import type { Site } from '@/types/shortcut'
import { normalizeUrl } from '@/utils/format'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import BatchEditDialog from './BatchEditDialog.vue'
import GroupEditDialog from './GroupEditDialog.vue'
import SiteEditDialog from './SiteEditDialog.vue'
import SiteIcon from './SiteIcon.vue'

const store = useShortcutsStore()
const settings = useSettingsStore()

const siteDialog = ref<{ open: boolean; groupId: string; site: Site | null }>({
  open: false,
  groupId: '',
  site: null,
})
const groupDialog = ref<{ open: boolean; group: { id: string; name: string } | null }>({
  open: false,
  group: null,
})
const batchOpen = ref(false)
const confirm = ref<{ open: boolean; title: string; desc: string; action: () => void }>({
  open: false,
  title: '',
  desc: '',
  action: () => {},
})

function openSite(site: Site) {
  const url = normalizeUrl(site.url)
  if (settings.settings.openLinkInNewTab) window.open(url, '_blank', 'noopener')
  else window.location.href = url
}

function openInNewTab(site: Site) {
  window.open(normalizeUrl(site.url), '_blank', 'noopener')
}

function askRemoveSite(groupId: string, site: Site) {
  confirm.value = {
    open: true,
    title: '删除网址',
    desc: `确定删除「${site.name}」吗？`,
    action: () => store.removeSite(groupId, site.id),
  }
}

function askRemoveGroup(group: { id: string; name: string; sites: Site[] }) {
  confirm.value = {
    open: true,
    title: '删除分组',
    desc:
      group.sites.length > 0
        ? `分组「${group.name}」内有 ${group.sites.length} 个网址，删除后无法恢复。`
        : `确定删除分组「${group.name}」吗？`,
    action: () => store.removeGroup(group.id),
  }
}

function onConfirm() {
  confirm.value.action()
}
</script>

<template>
  <section
    v-if="settings.settings.showShortcuts && store.groups.length > 0"
    class="mt-8 w-full max-w-3xl space-y-4"
  >
    <div v-for="group in store.groups" :key="group.id">
      <ContextMenu>
        <ContextMenuTrigger as-child>
          <div
            class="page-text mb-2 flex cursor-default items-center gap-1.5 text-sm font-medium text-white/90 select-none"
          >
            <span>{{ group.name }}</span>
            <span class="text-xs text-white/60">{{ group.sites.length }}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent class="w-44">
          <ContextMenuItem
            @click="siteDialog = { open: true, groupId: group.id, site: null }"
          >
            <Plus /> 添加网址
          </ContextMenuItem>
          <ContextMenuItem @click="groupDialog = { open: true, group }">
            <Pencil /> 重命名分组
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem @click="batchOpen = true">
            <SquarePen /> 批量编辑
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            class="text-destructive focus:text-destructive"
            @click="askRemoveGroup(group)"
          >
            <Trash2 /> 删除分组
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <draggable
        v-model="group.sites"
        item-key="id"
        group="sites"
        animation="200"
        class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8"
      >
        <template #item="{ element: site }">
          <ContextMenu>
            <ContextMenuTrigger as-child>
              <button
                type="button"
                class="glass page-text flex cursor-grab flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0 active:cursor-grabbing"
                :title="site.url"
                @click="openSite(site)"
              >
                <SiteIcon :name="site.name" :url="site.url" />
                <span class="w-full truncate text-center text-xs">{{ site.name }}</span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent class="w-40">
              <ContextMenuItem @click="openInNewTab(site)">
                <ExternalLink /> 在新标签页打开
              </ContextMenuItem>
              <ContextMenuItem
                @click="siteDialog = { open: true, groupId: group.id, site }"
              >
                <Pencil /> 编辑
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                class="text-destructive focus:text-destructive"
                @click="askRemoveSite(group.id, site)"
              >
                <Trash2 /> 删除
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </template>
      </draggable>
    </div>

    <SiteEditDialog v-model:open="siteDialog.open" :site="siteDialog.site" :group-id="siteDialog.groupId" />
    <GroupEditDialog v-model:open="groupDialog.open" :group="groupDialog.group" />
    <BatchEditDialog v-model:open="batchOpen" />
    <ConfirmDialog
      v-model:open="confirm.open"
      :title="confirm.title"
      :desc="confirm.desc"
      danger
      confirm-text="删除"
      @confirmed="onConfirm"
    />
  </section>
</template>
