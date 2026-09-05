<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import BackgroundLayer from '@/components/BackgroundLayer.vue'
import BackgroundShuffleButton from '@/components/BackgroundShuffleButton.vue'
import ClockDate from '@/components/ClockDate.vue'
import QuoteFooter from '@/components/QuoteFooter.vue'
import SearchBox from '@/components/SearchBox.vue'
import SettingsButton from '@/components/SettingsButton.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import WeatherInfo from '@/components/WeatherInfo.vue'
import ShortcutGroups from '@/components/shortcuts/ShortcutGroups.vue'
import SettingsModal from '@/components/settings/SettingsModal.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <BackgroundLayer />

  <div class="relative z-10 flex h-dvh flex-col">
    <div class="absolute top-4 right-4 z-20 flex gap-2">
      <BackgroundShuffleButton />
      <ThemeToggle />
      <SettingsButton />
    </div>

    <main class="flex flex-1 flex-col overflow-y-auto px-4 py-10">
      <div class="m-auto flex w-full flex-col items-center">
        <ClockDate />
        <WeatherInfo />
        <SearchBox />
        <ShortcutGroups />
      </div>
    </main>

    <QuoteFooter />
  </div>

  <SettingsModal />
  <Toaster position="top-center" :duration="2200" />
</template>
