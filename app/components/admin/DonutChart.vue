<template>
  <div v-if="hasData">
    <component
      :is="resolveComponent('DonutChart')"
      :data="values"
      :categories="chartCategories"
      :height="height"
      :radius="4"
      :arc-width="arcWidth"
      :legend-style="{ marginTop: '12px' }"
      type="full"
      :duration="400"
    />
  </div>
  <div v-else class="flex flex-col items-center justify-center py-8 text-center" :style="{ minHeight: `${height}px` }">
    <UIcon name="i-lucide-pie-chart" class="mb-2 h-8 w-8 text-(--ui-text-dimmed)" />
    <p class="text-sm text-(--ui-text-muted)">{{ emptyLabel || 'No data yet.' }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  labels: string[]
  values: number[]
  height?: number
  colors?: string[]
  emptyLabel?: string
  arcWidth?: number
}>(), {
  height: 260,
  arcWidth: 50,
})

const hasData = computed(() => props.values.length > 0 && props.values.some(v => v > 0))

const defaultColors = ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

const chartCategories = computed(() => {
  const colors = props.colors || defaultColors
  const cats: Record<string, { name: string, color: string }> = {}
  props.labels.forEach((label, i) => {
    const key = label.replace(/\s+/g, '_').toLowerCase()
    cats[key] = { name: label, color: colors[i % colors.length] }
  })
  return cats
})
</script>
