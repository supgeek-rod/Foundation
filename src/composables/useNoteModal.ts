import { ref } from 'vue'

// 模块级共享：笔记面板开关状态
const open = ref(false)

export function useNoteModal() {
  function show() {
    open.value = true
  }
  return { open, show }
}
