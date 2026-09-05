import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_GROUPS } from '@/constants/defaultGroups'
import type { ShortcutGroup } from '@/types/shortcut'
import { normalizeUrl } from '@/utils/format'
import { uid } from '@/utils/id'

export const useShortcutsStore = defineStore(
  'shortcuts',
  () => {
    const groups = ref<ShortcutGroup[]>(structuredClone(DEFAULT_GROUPS))

    function findGroup(id: string): ShortcutGroup | undefined {
      return groups.value.find((g) => g.id === id)
    }

    function addGroup(name: string): ShortcutGroup {
      const group: ShortcutGroup = { id: uid(), name: name.trim() || '新分组', sites: [] }
      groups.value.push(group)
      return group
    }
    function renameGroup(id: string, name: string) {
      const group = findGroup(id)
      if (group && name.trim()) group.name = name.trim()
    }
    function removeGroup(id: string) {
      groups.value = groups.value.filter((g) => g.id !== id)
    }
    function moveGroup(id: string, direction: -1 | 1) {
      const index = groups.value.findIndex((g) => g.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= groups.value.length) return
      const [group] = groups.value.splice(index, 1)
      groups.value.splice(target, 0, group!)
    }

    function addSite(groupId: string, name: string, url: string): boolean {
      const group = findGroup(groupId)
      if (!group || !url.trim()) return false
      group.sites.push({ id: uid(), name: name.trim() || url.trim(), url: normalizeUrl(url) })
      return true
    }
    function updateSite(
      groupId: string,
      siteId: string,
      partial: { name?: string; url?: string; targetGroupId?: string },
    ) {
      const group = findGroup(groupId)
      const index = group?.sites.findIndex((s) => s.id === siteId) ?? -1
      if (!group || index < 0) return
      const site = group.sites[index]!

      if (partial.targetGroupId && partial.targetGroupId !== groupId) {
        const target = findGroup(partial.targetGroupId)
        if (!target) return
        group.sites.splice(index, 1)
        target.sites.push(site)
      }
      if (partial.name !== undefined && partial.name.trim()) site.name = partial.name.trim()
      if (partial.url !== undefined && partial.url.trim()) site.url = normalizeUrl(partial.url)
    }
    function removeSite(groupId: string, siteId: string) {
      const group = findGroup(groupId)
      if (group) group.sites = group.sites.filter((s) => s.id !== siteId)
    }

    return {
      groups,
      addGroup,
      renameGroup,
      removeGroup,
      moveGroup,
      addSite,
      updateSite,
      removeSite,
    }
  },
  { persist: true },
)
