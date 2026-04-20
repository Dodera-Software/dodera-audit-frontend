<template>
  <div ref="containerRef" class="relative w-full" :style="{ height: `${height}px` }">
    <svg
      v-if="svgWidth > 0 && points.length >= 2"
      :width="svgWidth"
      :height="height"
      class="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient :id="`stroke-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e" />
          <stop offset="48%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#ef4444" />
        </linearGradient>
        <linearGradient :id="`area-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e" stop-opacity="0.28" />
          <stop offset="48%" stop-color="#f59e0b" stop-opacity="0.14" />
          <stop offset="100%" stop-color="#ef4444" stop-opacity="0.03" />
        </linearGradient>
      </defs>

      <!-- Area fill -->
      <path :d="areaPath" :fill="`url(#area-${uid})`" />

      <!-- Line stroke -->
      <path
        :d="linePath"
        fill="none"
        :stroke="`url(#stroke-${uid})`"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Hit zones + dots -->
      <g v-for="(pt, i) in points" :key="i">
        <circle
          :cx="pt.x"
          :cy="pt.y"
          r="14"
          fill="transparent"
          :class="clickable ? 'cursor-pointer' : 'cursor-default'"
          @mouseenter="onEnter(i)"
          @mouseleave="onLeave"
          @click="handleClick(i)"
        />
        <circle
          :cx="pt.x"
          :cy="pt.y"
          :r="hoveredIndex === i ? 5.5 : 3.5"
          :fill="dotColor(pt.score)"
          stroke="white"
          stroke-width="1.5"
          class="pointer-events-none transition-all duration-150"
        />
      </g>

      <!-- X-axis labels — anchored to avoid edge clipping -->
      <g v-if="!sparkline">
        <text
          v-for="(lbl, i) in axisLabels"
          :key="i"
          :x="lbl.x"
          :y="height - 4"
          :text-anchor="lbl.anchor"
          font-size="10"
          class="fill-(--ui-text-muted) select-none"
        >
          {{ lbl.text }}
        </text>
      </g>
    </svg>

    <!-- Tooltip — teleported to body to escape overflow:hidden parents -->
    <Teleport to="body">
      <Transition name="tip">
        <div
          v-if="tooltip.visible"
          :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
          class="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) px-3 py-1.5 text-center shadow-lg"
        >
          <p class="text-xs text-(--ui-text-muted)">{{ tooltip.label }}</p>
          <p class="text-sm font-bold" :class="tooltip.colorClass">{{ tooltip.score }}</p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface ChartPoint {
  x: number
  y: number
  score: number
  label: string
}

interface AxisLabel {
  x: number
  text: string
  anchor: 'start' | 'middle' | 'end'
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  label: string
  score: number
  colorClass: string
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

const uid = Math.random().toString(36).slice(2, 8)
const containerRef = ref<HTMLElement | null>(null)
const { width: svgWidth } = useElementSize(containerRef)
const hoveredIndex = ref<number | null>(null)

const tooltip = ref<TooltipState>({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  score: 0,
  colorClass: '',
})

const pad = computed(() => ({
  top: 12,
  right: 8,
  bottom: props.sparkline ? 6 : 28,
  left: 8,
}))

const innerW = computed(() => Math.max(0, svgWidth.value - pad.value.left - pad.value.right))
const innerH = computed(() => Math.max(0, props.height - pad.value.top - pad.value.bottom))

const yRange = computed(() => {
  if (props.yMin !== undefined && props.yMax !== undefined) {
    return { min: props.yMin, max: props.yMax }
  }
  if (!props.values.length) return { min: 0, max: 100 }
  const lo = Math.min(...props.values)
  const hi = Math.max(...props.values)
  const spread = hi - lo
  const padding = Math.max(5, spread * 0.3)
  return {
    min: Math.max(0, Math.floor(lo - padding)),
    max: Math.min(100, Math.ceil(hi + padding)),
  }
})

function toX(i: number): number {
  const count = props.values.length
  if (count <= 1) return pad.value.left + innerW.value / 2
  return pad.value.left + (i / (count - 1)) * innerW.value
}

function toY(score: number): number {
  const { min, max } = yRange.value
  if (max === min) return pad.value.top + innerH.value / 2
  return pad.value.top + ((max - score) / (max - min)) * innerH.value
}

const points = computed<ChartPoint[]>(() =>
  props.values.map((score, i) => ({
    x: toX(i),
    y: toY(score),
    score,
    label: props.labels[i] ?? '',
  })),
)

function buildCatmullRom(pts: ChartPoint[]): string {
  if (pts.length < 2) return ''
  const d: string[] = [`M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[Math.min(i + 2, pts.length - 1)]!
    const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(2)
    const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(2)
    const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(2)
    const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(2)
    d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`)
  }
  return d.join(' ')
}

const linePath = computed(() => buildCatmullRom(points.value))

const areaPath = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
  const bottom = (pad.value.top + innerH.value).toFixed(2)
  const last = pts[pts.length - 1]!
  const first = pts[0]!
  return `${buildCatmullRom(pts)} L ${last.x.toFixed(2)} ${bottom} L ${first.x.toFixed(2)} ${bottom} Z`
})

const axisLabels = computed<AxisLabel[]>(() => {
  const pts = points.value
  if (!pts.length) return []

  // Decide which indices to show (up to 4 labels)
  let indices: number[]
  if (pts.length <= 4) {
    indices = pts.map((_, i) => i)
  } else {
    const step = Math.ceil((pts.length - 1) / 3)
    const set = new Set<number>([0])
    for (let i = step; i < pts.length - 1; i += step) set.add(i)
    set.add(pts.length - 1)
    indices = [...set]
  }

  return indices.map((idx, pos) => {
    const pt = pts[idx]!
    let anchor: 'start' | 'middle' | 'end' = 'middle'
    if (pos === 0) anchor = 'start'
    else if (pos === indices.length - 1) anchor = 'end'
    return { x: pt.x, text: pt.label, anchor }
  })
})

function dotColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

function dotColorClass(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-amber-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

function onEnter(i: number): void {
  hoveredIndex.value = i
  const pt = points.value[i]
  if (!pt || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: rect.left + pt.x,
    y: rect.top + pt.y - 8,
    label: pt.label,
    score: pt.score,
    colorClass: dotColorClass(pt.score),
  }
}

function onLeave(): void {
  hoveredIndex.value = null
  tooltip.value.visible = false
}

function handleClick(i: number): void {
  if (props.clickable) emit('point-click', i)
}
</script>

<style scoped>
.tip-enter-active,
.tip-leave-active {
  transition: opacity 0.12s ease;
}
.tip-enter-from,
.tip-leave-to {
  opacity: 0;
}
</style>
