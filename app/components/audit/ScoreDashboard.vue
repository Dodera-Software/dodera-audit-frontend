<template>
  <div class="space-y-8">
    <!-- Overall score -->
    <div class="flex flex-col items-center gap-2 py-6">
      <p class="text-sm font-medium text-(--ui-text-muted)">{{ t('Overall score') }}</p>
      <div class="flex items-baseline gap-1">
        <span class="text-7xl font-bold tabular-nums" :class="scoreColor(displayScore)">
          {{ displayScore }}
        </span>
        <span class="text-2xl text-(--ui-text-muted)">/100</span>
      </div>
      <div v-if="delta?.overall != null" class="flex items-center gap-1 text-sm font-medium" :class="deltaColor(delta.overall)">
        <UIcon :name="deltaIcon(delta.overall)" class="h-4 w-4" />
        <span>{{ formatDelta(delta.overall) }}</span>
        <span class="text-(--ui-text-muted)">{{ t('vs previous') }}</span>
      </div>
    </div>

    <!-- Sub-scores row -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <UTooltip
        v-for="cat in SCORE_CATEGORIES"
        :key="cat.key"
        :text="categoryTooltip(cat.key)"
      >
        <UCard class="text-center">
          <div class="flex flex-col items-center gap-2">
            <UIcon :name="cat.icon" class="h-5 w-5 text-(--ui-text-muted)" />
            <p class="text-xs font-medium text-(--ui-text-muted)">{{ categoryLabel(cat.key) }}</p>
            <span
              class="text-2xl font-bold tabular-nums"
              :class="getCategoryScoreClass(cat.key)"
            >
              {{ scores?.[cat.key] ?? '-' }}
            </span>
            <div
              v-if="getCategoryDelta(cat.key) != null"
              class="flex items-center gap-0.5 text-xs font-medium"
              :class="deltaColor(getCategoryDelta(cat.key))"
            >
              <UIcon :name="deltaIcon(getCategoryDelta(cat.key))" class="h-3 w-3" />
              <span>{{ formatDelta(getCategoryDelta(cat.key)) }}</span>
            </div>
          </div>
        </UCard>
      </UTooltip>
    </div>

    <!-- Sparkline -->
    <div v-if="scoreHistory.length >= 2" class="mx-auto max-w-md">
      <p class="mb-2 text-center text-xs font-medium text-(--ui-text-muted)">{{ t('Score trend') }}</p>
      <div class="h-20">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
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
} from 'chart.js'
import { scoreColor, SCORE_CATEGORIES } from '~/constants/audit'
import type { ScoreCategoryKey } from '~/constants/audit'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler)

const props = defineProps<{
  overallScore: number
  scores: Record<string, number>
  delta: { overall: number | null, scores: Record<string, number | null> } | null
  scoreHistory: Array<{ overall_score: number, created_at: string }>
}>()

const { t } = useI18n()
const { formatDate } = useFormatters()

// Animated score count-up
const displayScore = ref(0)
let animationFrame: number | null = null

function animateScore(target: number) {
  const duration = 1000
  const start = performance.now()

  function step(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayScore.value = Math.round(eased * target)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(step)
    }
  }

  animationFrame = requestAnimationFrame(step)
}

onMounted(() => {
  animateScore(props.overallScore)
})

onUnmounted(() => {
  if (!animationFrame) return
  cancelAnimationFrame(animationFrame)
})

// Category helpers
function getCategoryScoreClass(key: ScoreCategoryKey): string {
  const value = props.scores?.[key]
  if (value == null) return 'text-(--ui-text-muted)'
  return scoreColor(value)
}

function getCategoryDelta(key: ScoreCategoryKey): number | null {
  return props.delta?.scores?.[key] ?? null
}

function deltaColor(value: number | null): string {
  if (value == null || value === 0) return 'text-(--ui-text-muted)'
  return value > 0 ? 'text-green-500' : 'text-red-500'
}

function deltaIcon(value: number | null): string {
  if (value == null || value === 0) return 'i-lucide-minus'
  return value > 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'
}

function formatDelta(value: number | null): string {
  if (value == null) return ''
  if (value === 0) return '0'
  return value > 0 ? `+${value}` : `${value}`
}

function categoryLabel(key: ScoreCategoryKey): string {
  const labels: Record<ScoreCategoryKey, () => string> = {
    clarity: () => t('Clarity'),
    trust: () => t('Trust'),
    conversion: () => t('Conversion'),
    performance: () => t('Performance'),
    technical: () => t('Technical'),
  }
  return labels[key]()
}

function categoryTooltip(key: ScoreCategoryKey): string {
  const tooltips: Record<ScoreCategoryKey, () => string> = {
    clarity: () => t('How clear and understandable your messaging is'),
    trust: () => t('How trustworthy your site appears to visitors'),
    conversion: () => t('How effectively your site drives user actions'),
    performance: () => t('Page load speed and Core Web Vitals'),
    technical: () => t('JavaScript errors, accessibility, and code quality'),
  }
  return tooltips[key]()
}

// Sparkline chart
const chartData = computed(() => ({
  labels: props.scoreHistory.map(h => formatDate(h.created_at)),
  datasets: [
    {
      data: props.scoreHistory.map(h => h.overall_score),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#3b82f6',
      tension: 0.3,
      fill: true,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: { display: false },
    y: { display: false, min: 0, max: 100 },
  },
} as const
</script>
