<template>
  <AreaChart
    :data="chartData"
    :categories="chartCategories"
    :height="height"
    :x-formatter="xFormatter"
    :curve-type="sparkline ? 'monotoneX' : 'monotoneX'"
    :hide-legend="true"
    :hide-x-axis="sparkline"
    :hide-y-axis="sparkline"
    :y-grid-line="!sparkline"
    :y-domain="[yMin, yMax]"
    :duration="400"
  />
</template>

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
  yMin: 0,
  yMax: 100,
  clickable: false,
  sparkline: false,
})

const chartData = computed(() =>
  props.labels.map((label, i) => ({
    _label: label,
    score: props.values[i] ?? 0,
  })),
)

const chartCategories = computed(() => ({
  score: { name: 'Score', color: props.color },
}))

const xFormatter = computed(() =>
  (i: number) => chartData.value[i]?._label ?? '',
)
</script>
