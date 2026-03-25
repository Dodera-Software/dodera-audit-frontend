<template>
  <div v-if="data.length >= 2" :style="{ height: `${height}px` }">
    <Line :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="py-4 text-center text-xs text-(--ui-text-muted)">
    {{ t('Not enough data for a trend chart. Run more audits.') }}
  </p>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = withDefaults(defineProps<{
  data: Array<{ overall_score: number, created_at: string }>
  height?: number
  clickable?: boolean
}>(), {
  height: 120,
  clickable: false,
})

const emit = defineEmits<{
  pointClick: [index: number]
}>()

const { t } = useI18n()
const { formatDate } = useFormatters()

const chartData = computed(() => ({
  labels: props.data.map(d => formatDate(d.created_at)),
  datasets: [
    {
      data: props.data.map(d => d.overall_score),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: '#3b82f6',
      pointHitRadius: 15,
      tension: 0.3,
      fill: true,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      ticks: { maxTicksLimit: 8, font: { size: 11 } },
    },
    y: {
      min: 0,
      max: 100,
      ticks: { stepSize: 25 },
    },
  },
  ...(props.clickable
    ? {
        onClick: (_event: any, elements: any[]) => {
          if (elements.length > 0) emit('pointClick', elements[0].index)
        },
        onHover: (event: any, elements: any[]) => {
          const canvas = event.native?.target as HTMLCanvasElement | undefined
          if (canvas) canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default'
        },
      }
    : {}),
}))
</script>
