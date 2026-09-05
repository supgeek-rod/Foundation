<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBackground } from '@/composables/useBackground'

const { source, imageUrl, blur, dim, ensureLoaded } = useBackground()

// 背景图加载失败（如必应壁纸不可达）时回退渐变，切换图片源后重置
const imgError = ref(false)

watch(source, ensureLoaded, { immediate: true })
watch(imageUrl, () => {
  imgError.value = false
})
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-[#101014]">
    <template v-if="imageUrl && !imgError">
      <img
        :key="imageUrl"
        :src="imageUrl"
        alt=""
        class="size-full object-cover"
        :style="{
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          transform: blur > 0 ? 'scale(1.08)' : undefined,
        }"
        @error="imgError = true"
      />
      <div class="absolute inset-0 bg-black" :style="{ opacity: dim / 100 }" />
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
      <div class="absolute inset-0 bg-black" :style="{ opacity: dim / 200 }" />
    </template>
  </div>
</template>

<style scoped>
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
