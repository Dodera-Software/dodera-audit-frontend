<template>
  <div class="relative">
    <!-- Blurred content slot -->
    <div
      :class="locked ? 'pointer-events-none select-none blur-sm' : ''"
      :aria-hidden="locked ? 'true' : undefined"
    >
      <slot />
    </div>

    <!-- Lock overlay -->
    <div
      v-if="locked"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-(--ui-bg)/70 backdrop-blur-sm"
    >
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--ui-primary)/10 ring-1 ring-(--ui-primary)/20">
        <UIcon name="i-lucide-lock" class="h-6 w-6 text-(--ui-primary)" />
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ title }}</p>
        <p v-if="description" class="mt-1 max-w-xs text-xs text-(--ui-text-muted)">{{ description }}</p>
      </div>
      <UButton size="sm" icon="i-lucide-zap" @click="$emit('upgrade')">
        {{ t('Upgrade to unlock') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  locked: boolean
  title?: string
  description?: string
}>(), {
  title: 'Pro feature',
  description: undefined,
})

defineEmits<{ upgrade: [] }>()

const { t } = useI18n()
</script>
