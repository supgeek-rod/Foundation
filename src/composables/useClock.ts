import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { formatDateCN, pad2, weekdayCN } from '@/utils/format'

const now = ref(new Date())

export function useClock() {
  useIntervalFn(
    () => {
      now.value = new Date()
    },
    1000,
  )

  const hours = computed(() => pad2(now.value.getHours()))
  const minutes = computed(() => pad2(now.value.getMinutes()))
  const dateText = computed(() => formatDateCN(now.value))
  const weekText = computed(() => weekdayCN(now.value))

  return { now, hours, minutes, dateText, weekText }
}
