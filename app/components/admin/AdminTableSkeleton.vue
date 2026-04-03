<template>
  <UCard>
    <div class="mb-4 flex items-center justify-between">
      <USkeleton class="h-4 w-24" />
      <USkeleton class="h-8 w-32 rounded-md" />
    </div>
    <div class="space-y-3">
      <USkeleton class="h-9 w-full rounded-md bg-(--ui-bg-elevated)" />
      <USkeleton v-for="i in rows" :key="i" class="h-10 w-full" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
}>(), {
  rows: 6,
})
</script>
