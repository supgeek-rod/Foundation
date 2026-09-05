<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBackground } from '@/composables/useBackground'
import { useTheme } from '@/composables/useTheme'

const { source, imageUrl, blur, dim, ensureLoaded } = useBackground()
const { isDark } = useTheme()

// 主题自适应：深色压暗（黑色遮罩全强度），浅色提亮（遮罩仅 40% 强度）
const overlayOpacity = computed(() =>
  isDark.value ? dim.value / 100 : (dim.value * 0.4) / 100,
)

const imgStyle = computed(() => {
  const filters: string[] = []
  if (blur.value > 0) filters.push(`blur(${blur.value}px)`)
  filters.push(isDark.value ? 'brightness(0.88)' : 'brightness(1.06) saturate(1.04)')
  return {
    filter: filters.join(' '),
    transform: blur.value > 0 ? 'scale(1.08)' : undefined,
  }
})

// 背景图加载失败（如必应壁纸不可达）时回退渐变，切换图片源后重置
const imgError = ref(false)
const imgLoaded = ref(false)

watch(source, ensureLoaded, { immediate: true })
watch(imageUrl, () => {
  imgError.value = false
  imgLoaded.value = false
})
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-[#101014]">
    <template v-if="imageUrl && !imgError">
      <img
        :key="imageUrl"
        :src="imageUrl"
        alt=""
        class="size-full object-cover transition-opacity duration-700"
        :class="imgLoaded ? 'opacity-100' : 'opacity-0'"
        :style="imgStyle"
        @load="imgLoaded = true"
        @error="imgError = true"
      />
      <div class="absolute inset-0 bg-black" :style="{ opacity: overlayOpacity }" />
    </template>

    <template v-else>
      <div
        class="absolute inset-0 transition-colors"
        :style="{
          background:
            'linear-gradient(135deg, var(--grad-from) 0%, var(--grad-mid) 55%, var(--grad-to) 100%)',
        }"
      />
      <div
        class="absolute -top-24 -left-24 size-[36rem] rounded-full opacity-50 blur-3xl"
        style="background: radial-gradient(circle, #22d3ee55, transparent 65%)"
      />
      <div
        class="absolute -right-32 -bottom-40 size-[40rem] rounded-full opacity-50 blur-3xl"
        style="background: radial-gradient(circle, #f472b655, transparent 65%)"
      />
      <div class="absolute inset-0 bg-black" :style="{ opacity: overlayOpacity }" />
    </template>
  </div>
</template>

<style>
/* 全局自定义属性，随 .dark 切换；不能加 scoped（scoped 会让 :root/.dark 匹配不到 html） */
:root {
  --grad-from: #667eea;
  --grad-mid: #764ba2;
  --grad-to: #e08bab;
}

.dark {
  --grad-from: #0f2027;
  --grad-mid: #203a43;
  --grad-to: #2c5364;
}
</style>
