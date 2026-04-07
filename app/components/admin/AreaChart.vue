<template>
  <div v-if="hasData">
    <!-- Bar chart uses different props -->
    <BarChart
      v-if="type === 'bar'"
      :data="barData"
      :categories="barCategories"
      :y-axis="barSeriesKeys"
      :x-formatter="barXFormatter"
      :height="height"
      :y-grid-line="true"
      :stacked="isMultiColorBar ? true : stacked"
      :radius="4"
      :duration="400"
      :tooltip-title-formatter="tooltipTitle"
    >
      <!-- Custom tooltip for multi-color bars: VisStackedBar wraps the raw datum so the
           default Tooltip component never finds matching category keys and shows no rows. -->
      <template v-if="isMultiColorBar" #tooltip="{ values: barTooltipValues }">
        <template v-for="tt in [multiColorBarTooltip(barTooltipValues)]" :key="0">
          <div v-if="tt" class="flex flex-col text-sm">
            <p class="border-b border-(--ui-border) px-3 pb-2 pt-3 font-semibold capitalize text-(--ui-text-highlighted)">
              {{ tt.label }}
            </p>
            <div class="flex items-center gap-2 px-3 py-2">
              <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: tt.color }" />
              <span class="flex-1 text-(--ui-text)">{{ props.series[0]?.name }}</span>
              <span class="font-semibold tabular-nums text-(--ui-text-highlighted)">{{ tt.value }}</span>
            </div>
          </div>
        </template>
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
      :tooltip-title-formatter="tooltipTitle"
    />
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
    cats[s.name] = { name: s.name, color: colors[i % colors.length] ?? defaultColors[0]! }
  })
  return cats
})

// Multi-color bars: auto-enabled for single-series bar charts so each bar gets a distinct color
// and the legend labels match the category names rather than the series name (e.g. "Users")
const isMultiColorBar = computed(() => props.type === 'bar' && props.series.length === 1)

const multiColorBarData = computed(() => {
  const singleSeries = props.series[0]
  if (!singleSeries) return []
  return props.categories.map((label, i) => {
    const point: Record<string, string | number> = { _label: label }
    props.categories.forEach((cat, j) => {
      point[cat] = j === i ? (singleSeries.data[i] ?? 0) : 0
    })
    return point
  })
})

const multiColorBarCategories = computed(() => {
  const cats: Record<string, { name: string, color: string }> = {}
  props.categories.forEach((label, i) => {
    cats[label] = { name: label, color: defaultColors[i % defaultColors.length] ?? defaultColors[0]! }
  })
  return cats
})

const barData = computed(() => isMultiColorBar.value ? multiColorBarData.value : chartData.value)
const barCategories = computed(() => isMultiColorBar.value ? multiColorBarCategories.value : chartCategories.value)
const barSeriesKeys = computed(() => isMultiColorBar.value ? props.categories : seriesKeys.value)
const barXFormatter = (_i: number) => ''

const xFormatter = computed(() =>
  (i: number) => chartData.value[i]?._label as string ?? '',
)

interface BarTooltipWrapper {
  datum?: Record<string, string | number>
  stacked?: [number, number]
}

function multiColorBarTooltip(values: unknown): { label: string; color: string; value: number } | null {
  if (!values || typeof values !== 'object') return null
  const w = values as BarTooltipWrapper
  if (!w.datum) return null
  const label = String(w.datum._label ?? '')
  if (!label) return null
  const value = w.stacked ? Math.round(w.stacked[1] - w.stacked[0]) : Number(w.datum[label] ?? 0)
  const color = multiColorBarCategories.value[label]?.color ?? defaultColors[0]!
  return { label, color, value }
}

function tooltipTitle(data: Record<string, unknown>): string {
  // VisStackedBar wraps the raw datum: { datum: rawItem, index, stacked, stackIndex, isEnding }
  // VisGroupedBar / AreaChart / LineChart pass the raw data item directly
  const inner = (data.datum as Record<string, unknown>) ?? data
  return String(inner._label ?? data._label ?? '')
}
</script>
