<template>
  <div class="grid grid-cols-2 gap-4" :class="colsClass">
    <UiSkeletonStatCard v-for="i in count" :key="i" />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  count?: number
  cols?: number
}>(), {
  count: 4,
  cols: 4,
})

const colsClass = computed(() => {
  const map: Record<number, string> = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }
  return map[props.cols] || 'lg:grid-cols-4'
})
</script>
