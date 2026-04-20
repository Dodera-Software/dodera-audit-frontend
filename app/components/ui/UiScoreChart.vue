<template>
  <div class="w-full">
    <AreaChart
      v-if="chartData.length >= 2"
      :data="chartData"
      :categories="chartCategories"
      :height="height"
      :curve-type="CurveType.CatmullRom"
      :y-domain="yDomain"
      :x-formatter="xFormatter"
      :hide-x-axis="sparkline"
      :hide-y-axis="true"
      :hide-legend="true"
      :y-grid-line="!sparkline"
      :gradient-stops="gradientStops"
      :line-width="2.5"
      :duration="400"
      :class="clickable ? 'cursor-pointer' : ''"
      @click="handleClick"
    >
      <template #tooltip="{ values }">
        <div v-if="values" class="flex flex-col gap-0.5 px-3 py-1.5 text-center">
          <p class="text-xs text-(--ui-text-muted)">{{ values._label }}</p>
          <p class="text-sm font-bold" :class="scoreColorClass(values.Score as number)">{{ values.Score }}</p>
        </div>
      </template>
    </AreaChart>
  </div>
</template>

<script setup lang="ts">
import { CurveType } from 'vue-chrts'

interface ChartDataPoint {
  _label: string
  Score: number
}

const props = withDefaults(defineProps<{
  labels: string[]
  values: number[]
  height?: number
  yMin?: number
  yMax?: number
  clickable?: boolean
  sparkline?: boolean
}>(), {
  height: 160,
  clickable: false,
  sparkline: false,
})

const emit = defineEmits<{
  'point-click': [index: number]
}>()

const chartData = computed<ChartDataPoint[]>(() =>
  props.labels.map((label, i) => ({
    _label: label,
    Score: props.values[i] ?? 0,
  })),
)

const latestScore = computed(() => props.values.at(-1) ?? 0)

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

const chartCategories = computed<Record<string, { name: string; color: string }>>(() => ({
  Score: { name: 'Score', color: scoreColor(latestScore.value) },
}))

const yDomain = computed<[number | undefined, number | undefined]>(() => {
  if (props.yMin !== undefined || props.yMax !== undefined) {
    return [props.yMin, props.yMax]
  }
  const validValues = props.values.filter(v => v != null)
  if (validValues.length === 0) return [undefined, undefined]
  const minVal = Math.min(...validValues)
  const maxVal = Math.max(...validValues)
  const padding = Math.max((maxVal - minVal) * 0.2, 5)
  return [Math.max(0, Math.floor(minVal - padding)), Math.min(100, Math.ceil(maxVal + padding))]
})

const gradientStops = [
  { offset: '0%', stopOpacity: 0.45 },
  { offset: '48%', stopOpacity: 0.22 },
  { offset: '100%', stopOpacity: 0.05 },
]

const xFormatter = computed(() =>
  (i: number) => chartData.value[i]?._label ?? '',
)

function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-amber-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

function handleClick(_event: MouseEvent, values?: ChartDataPoint): void {
  if (!props.clickable || !values) return
  const idx = props.labels.indexOf(values._label)
  if (idx !== -1) emit('point-click', idx)
}
</script>
