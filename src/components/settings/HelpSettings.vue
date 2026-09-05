<script setup lang="ts">
const helps = [
  {
    title: '天气定位不准？',
    desc: '天气默认通过浏览器定位获取，若拒绝授权会回退 IP 定位；也可在「基本设置 → 城市定位」中手动搜索指定城市。',
  },
  {
    title: '数据存在哪里？',
    desc: '全部数据仅保存在本浏览器（localStorage / IndexedDB），可在「数据备份」中导出 JSON 备份或迁移到其他设备。',
  },
  {
    title: '快捷方式怎么管理？',
    desc: '在主页右键点击分组或网址即可添加、编辑、删除与排序；拖拽网址可在分组内或跨分组移动。',
  },
  {
    title: '搜索技巧',
    desc: '输入内容回车即用当前引擎搜索；直接输入网址（如 github.com）则直接跳转；Tab 键快速切换搜索引擎；按 / 或 Ctrl+K 聚焦搜索框。',
  },
]
</script>

<template>
  <div class="space-y-3">
    <div v-for="help in helps" :key="help.title" class="rounded-xl bg-muted/70 px-4 py-3.5">
      <div class="text-sm font-medium">{{ help.title }}</div>
      <p class="mt-1 text-xs leading-relaxed text-muted-foreground">{{ help.desc }}</p>
    </div>
    <p class="pt-1 text-xs text-muted-foreground">更多问题或建议，欢迎通过项目仓库 Issues 反馈。</p>
  </div>
</template>
