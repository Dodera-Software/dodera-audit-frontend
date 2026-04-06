<template>
  <div v-if="hasData">
    <!-- Bar chart uses different props -->
    <BarChart
      v-if="type === 'bar'"
      :data="chartData"
      :categories="chartCategories"
      :y-axis="seriesKeys"
      x-axis="_label"
      :height="height"
      :y-grid-line="true"
      :stacked="stacked"
      :radius="4"
      :duration="400"
    >
      <template #tooltip="{ values: tipValues }">
        <ChartTooltip :values="tipValues" :categories="chartCategories" />
      </template>
    </BarChart>
    <!-- Line/Area use the same API -->
    <component
      v-else
      :is="type === 'line' ? resolveComponent('LineChart') : resolveComponent('AreaChart')"
      :data="chartData"
      :categories="chartCategories"
      :height="height"
      :x-formatter="xFormatter"
      curve-type="monotoneX"
      :y-grid-line="true"
      :stacked="stacked"
      :duration="400"
    >
      <template #tooltip="{ values: tipValues }">
        <ChartTooltip :values="tipValues" :categories="chartCategories" />
      </template>
    </component>
  </div>
  <div v-else class="flex flex-col items-center justify-center py-8 text-center" :style="{ minHeight: `${height}px` }">
    <UIcon name="i-lucide-bar-chart-3" class="mb-2 h-8 w-8 text-(--ui-text-dimmed)" />
    <p class="text-sm text-(--ui-text-muted)">{{ emptyLabel || 'No data yet.' }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  series: { name: string, data: number[] }[]
  categories: string[]
  height?: number
  type?: 'area' | 'bar' | 'line'
  colors?: string[]
  stacked?: boolean
  emptyLabel?: string
}>(), {
  height: 220,
  type: 'area',
  stacked: false,
})

const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

const hasData = computed(() =>
  props.series.length > 0 && props.series.some(s => s.data.length > 0 && s.data.some(v => v > 0)),
)

const seriesKeys = computed(() => props.series.map(s => s.name))

const chartData = computed(() =>
  props.categories.map((label, i) => {
    const point: Record<string, string | number> = { _label: label }
    props.series.forEach((s) => {
      point[s.name] = s.data[i] ?? 0
    })
    return point
  }),
)

const chartCategories = computed(() => {
  const colors = props.colors || defaultColors
  const cats: Record<string, { name: string, color: string }> = {}
  props.series.forEach((s, i) => {
    cats[s.name] = { name: s.name, color: colors[i % colors.length] }
  })
  return cats
})

const xFormatter = computed(() =>
  (i: number) => chartData.value[i]?._label as string ?? '',
)
</script>
