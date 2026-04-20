<template>
  <UiScoreChart
    :labels="labels"
    :values="values"
    :height="height"
    :y-min="yMin"
    :y-max="yMax"
    :clickable="clickable"
    :sparkline="sparkline"
    @point-click="(i: number) => emit('point-click', i)"
  />
</template>

<!-- Full chart logic lives in components/ui/UiScoreChart.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  labels: string[]
  values: number[]
  height?: number
  color?: string
  showAxes?: boolean
  yMin?: number
  yMax?: number
  clickable?: boolean
  sparkline?: boolean
}>(), {
  height: 160,
  color: '#34d399',
  showAxes: true,
  clickable: false,
  sparkline: false,
})

const emit = defineEmits<{
  'point-click': [index: number]
}>()
</script>
