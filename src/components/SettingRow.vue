<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 rounded-xl bg-muted/70 px-4 py-3.5">
    <div class="min-w-0">
      <div class="text-sm font-medium">{{ title }}</div>
      <div v-if="desc" class="mt-0.5 text-xs text-muted-foreground">{{ desc }}</div>
    </div>
    <div class="shrink-0">
      <slot />
    </div>
  </div>
</template>
