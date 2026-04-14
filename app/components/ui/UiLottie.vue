<template>
  <ClientOnly>
    <Vue3Lottie v-bind="lottieBindings" />
    <template #fallback>
      <div :style="{ height: `${height}px`, width: `${width}px` }" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

defineOptions({ inheritAttrs: false })

interface Props {
  src?: string
  animationData?: Record<string, unknown>
  height?: number
  width?: number
  loop?: boolean
  autoPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 140,
  width: 140,
  loop: true,
  autoPlay: true,
})

const attrs = useAttrs()

const lottieBindings = computed(() => ({
  ...attrs,
  ...(props.animationData ? { animationData: props.animationData } : { animationLink: props.src }),
  height: props.height,
  width: props.width,
  loop: props.loop,
  autoPlay: props.autoPlay,
}))
</script>
