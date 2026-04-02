<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-palette" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Appearance') }}</h2>
      </div>
    </template>

    <div class="flex items-center justify-between py-2">
      <div>
        <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Theme') }}</p>
        <p class="text-xs text-(--ui-text-muted)">{{ t('Choose how PawByTech looks to you.') }}</p>
      </div>

      <div class="flex gap-1">
        <UButton
          v-for="mode in themeModes"
          :key="mode.value"
          :icon="mode.icon"
          :variant="colorMode.preference === mode.value ? 'soft' : 'ghost'"
          :color="colorMode.preference === mode.value ? 'primary' : 'neutral'"
          size="xs"
          @click="colorMode.preference = mode.value"
        >
          {{ t(mode.label) }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()

const themeModes = [
  { value: 'light', icon: 'i-lucide-sun', label: 'Light' },
  { value: 'dark', icon: 'i-lucide-moon', label: 'Dark' },
  { value: 'system', icon: 'i-lucide-monitor', label: 'System' },
]
</script>
