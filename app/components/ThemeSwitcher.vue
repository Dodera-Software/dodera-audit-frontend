<template>
  <UButton
    variant="ghost"
    color="neutral"
    :size="size"
    square
    :icon="icon"
    :aria-label="t('Toggle theme')"
    @click="toggleTheme"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>(), {
  size: 'sm',
})

const { t } = useI18n()
const colorMode = useColorMode()

const icon = computed(() => {
  if (colorMode.preference === 'dark') return 'i-lucide-moon'
  if (colorMode.preference === 'light') return 'i-lucide-sun'
  return 'i-lucide-monitor'
})

function toggleTheme() {
  const modes = ['light', 'dark', 'system'] as const
  const current = modes.indexOf(colorMode.preference as 'light' | 'dark' | 'system')
  colorMode.preference = modes[(current + 1) % modes.length]!
}
</script>
