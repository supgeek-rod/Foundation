<script setup lang="ts">
import { computed } from 'vue'
import bilibiliSvg from '@/assets/icons/engines/bilibili.svg'
import baiduSvg from '@/assets/icons/engines/baidu.svg'
import bingSvg from '@/assets/icons/engines/bing.svg'
import duckduckgoSvg from '@/assets/icons/engines/duckduckgo.svg'
import githubSvg from '@/assets/icons/engines/github.svg'
import googleSvg from '@/assets/icons/engines/google.svg'
import zhihuSvg from '@/assets/icons/engines/zhihu.svg'
import type { SearchEngine } from '@/types/search'

/** 内置引擎 → 本地品牌 SVG（离线可用，随 PWA 预缓存） */
const BUILTIN_ICONS: Record<string, string> = {
  bing: bingSvg,
  baidu: baiduSvg,
  google: googleSvg,
  duckduckgo: duckduckgoSvg,
  github: githubSvg,
  bilibili: bilibiliSvg,
  zhihu: zhihuSvg,
}

const props = defineProps<{
  engine: SearchEngine
  /** 徽标尺寸类（Tailwind size-*），默认 size-8 */
  size?: string
}>()

const iconUrl = computed(() =>
  props.engine.builtin ? (BUILTIN_ICONS[props.engine.builtin] ?? '') : '',
)
const letter = computed(() => props.engine.name.trim().slice(0, 1).toUpperCase() || '?')
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
    :class="size ?? 'size-8'"
    :style="{ background: engine.color }"
  >
    <!-- 内置品牌图标统一渲染为白色，与色块徽标风格一致；自定义引擎回退首字母 -->
    <img v-if="iconUrl" :src="iconUrl" alt="" class="size-[56%] object-contain brightness-0 invert" />
    <template v-else>{{ letter }}</template>
  </span>
</template>
