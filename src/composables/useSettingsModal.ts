import { ref } from 'vue'

// 模块级共享：设置面板开关状态
const open = ref(false)

export function useSettingsModal() {
  function show() {
    open.value = true
  }
  function hide() {
    open.value = false
  }
  return { open, show, hide }
}
