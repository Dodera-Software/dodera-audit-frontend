<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-(--ui-bg)"
    >
      <UiLottie
        :animation-data="bellAnimation"
        :height="260"
        :width="260"
      />
      <h1 class="mt-6 text-3xl font-bold text-(--ui-text-highlighted)">{{ title }}</h1>
      <p class="mt-2 text-(--ui-text-muted)">{{ subtitle }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import bellAnimation from '~/assets/animations/bell.json'

interface Props {
  show: boolean
  title: string
  subtitle: string
}

defineProps<Props>()
</script>
