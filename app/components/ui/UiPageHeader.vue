<template>
  <div>
    <h1 class="text-xl font-bold text-(--ui-text-highlighted)">
      <slot name="title">{{ title }}</slot>
    </h1>
    <p v-if="subtitle || $slots.subtitle" class="mt-0.5 text-sm text-(--ui-text-muted)">
      <slot name="subtitle">{{ subtitle }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

defineProps<Props>()
</script>
