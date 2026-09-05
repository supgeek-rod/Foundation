<script setup lang="ts">
const stack = ['Vue 3', 'Vite', 'TypeScript', 'Tailwind CSS v4', 'shadcn-vue', 'Pinia', 'VueUse', 'PWA']
</script>

<template>
  <div class="space-y-3">
    <div class="rounded-xl bg-muted/70 px-4 py-4">
      <div class="flex items-center gap-3">
        <img src="/favicon.svg" alt="logo" class="size-10 rounded-lg" />
        <div>
          <div class="text-base font-bold">起始页</div>
          <div class="text-xs text-muted-foreground">v1.0.0 · 简洁优雅的浏览器起始页</div>
        </div>
      </div>
      <p class="mt-3 text-xs leading-relaxed text-muted-foreground">
        集时间日期、实时天气、多引擎搜索、分组快捷方式与个性化设置于一体；纯前端实现，数据全部本地存储，可作为浏览器主页或 PWA 应用使用。
      </p>
    </div>

    <div class="rounded-xl bg-muted/70 px-4 py-4">
      <div class="mb-2 text-sm font-medium">技术栈</div>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="item in stack"
          :key="item"
          class="rounded-md bg-foreground/5 px-2 py-1 text-xs text-muted-foreground"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <div class="rounded-xl bg-muted/70 px-4 py-4 text-xs leading-relaxed text-muted-foreground">
      界面设计参考开源项目
      <a
        class="text-foreground underline underline-offset-2"
        href="https://github.com/imsyy/home"
        target="_blank"
        rel="noopener"
        >imsyy/home</a
      >；天气数据来自 Open-Meteo，一言来自 Hitokoto，壁纸来自必应每日一图。本项目基于 MIT 许可开源。
    </div>
  </div>
</template>
