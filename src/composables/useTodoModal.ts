import { ref } from 'vue'

// 模块级共享：待办面板开关状态
const open = ref(false)

export function useTodoModal() {
  function show() {
    open.value = true
  }
  return { open, show }
}
