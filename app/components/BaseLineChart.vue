<template>
  <ClientOnly>
    <div :style="{ height: `${height}px` }">
      <apexchart
        type="area"
        :height="height"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </ClientOnly>
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
  color: 'emerald',
  showAxes: true,
  yMin: 0,
  yMax: 100,
  clickable: false,
  sparkline: false,
})

const emit = defineEmits<{
  pointClick: [index: number]
}>()

const colorMode = useColorMode()

const COLORS: Record<string, string> = {
  emerald: '#34d399',
  blue: '#60a5fa',
  violet: '#a78bfa',
  red: '#f87171',
  amber: '#fbbf24',
}

const isDark = computed(() => {
  if (colorMode.preference === 'dark') return true
  if (colorMode.preference === 'light') return false
  return colorMode.value === 'dark'
})

const lineColor = computed(() => COLORS[props.color] ?? COLORS.emerald)

const series = computed(() => [
  {
    name: 'Score',
    data: props.values,
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: props.height,
    background: 'transparent',
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false },
    zoom: { enabled: false },
    sparkline: { enabled: props.sparkline },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 600,
      dynamicAnimation: { speed: 350 },
    },
    events: props.clickable
      ? {
          dataPointSelection: (_event: unknown, _chart: unknown, config: { dataPointIndex: number }) => {
            emit('pointClick', config.dataPointIndex)
          },
        }
      : {},
    selection: { enabled: false },
  },
  colors: [lineColor.value],
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: props.sparkline ? 2 : 3,
    lineCap: 'round',
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      opacityFrom: 0.35,
      opacityTo: 0.0,
      stops: [0, 100],
    },
  },
  markers: {
    size: props.sparkline ? 0 : 5,
    colors: [lineColor.value],
    strokeColors: isDark.value ? '#18181b' : '#ffffff',
    strokeWidth: 3,
    hover: { size: 7, sizeOffset: 3 },
    discrete: props.clickable
      ? props.values.map((_v, i) => ({
          seriesIndex: 0,
          dataPointIndex: i,
          fillColor: lineColor.value,
          strokeColor: isDark.value ? '#18181b' : '#ffffff',
          size: 5,
        }))
      : [],
  },
  grid: {
    show: !props.sparkline,
    borderColor: isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    strokeDashArray: 6,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  xaxis: {
    categories: props.labels,
    labels: {
      show: !props.sparkline && props.showAxes,
      style: {
        colors: isDark.value ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
        fontSize: '11px',
        fontFamily: 'Inter',
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    crosshairs: {
      show: !props.sparkline,
      stroke: { color: isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', dashArray: 4 },
    },
    tooltip: { enabled: false },
  },
  yaxis: {
    show: !props.sparkline && props.showAxes,
    min: props.yMin,
    max: props.yMax,
    tickAmount: 4,
    labels: {
      style: {
        colors: isDark.value ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
        fontSize: '11px',
        fontFamily: 'Inter',
      },
    },
  },
  tooltip: {
    enabled: !props.sparkline,
    theme: isDark.value ? 'dark' : 'light',
    style: { fontSize: '12px', fontFamily: 'Inter' },
    x: { show: true },
    y: {
      formatter: (val: number) => `${val}/100`,
    },
    marker: { show: true },
    custom: undefined,
  },
  states: {
    hover: { filter: { type: 'none' } },
    active: { filter: { type: 'none' } },
  },
  ...(props.clickable ? { cursor: 'pointer' } : {}),
}))
</script>
