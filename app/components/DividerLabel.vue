<template>
  <div class="flex items-center gap-3" :class="props.class">
    <div class="h-px flex-1 bg-(--ui-border)" />
    <span class="text-xs uppercase tracking-wide text-(--ui-text-dimmed)">
      <slot />
    </span>
    <div class="h-px flex-1 bg-(--ui-border)" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  class?: string
}>()
</script>
