<template>
  <div>
    <!-- Hero: Overall score with radial ring -->
    <div class="flex flex-col items-center py-8">
      <div class="relative h-48 w-48">
        <svg class="h-full w-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="88"
            fill="none"
            stroke="currentColor"
            stroke-width="12"
            class="text-(--ui-bg-accented)"
          />
          <circle
            cx="100" cy="100" r="88"
            fill="none"
            :stroke="ringColor"
            stroke-width="12"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeOffset"
            class="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-5xl font-bold tabular-nums" :class="scoreColor(displayScore)">
            {{ displayScore }}
          </span>
          <span class="text-sm text-(--ui-text-dimmed)">/100</span>
        </div>
      </div>
      <p class="mt-4 text-sm font-medium text-(--ui-text-muted)">{{ t('Overall score') }}</p>
      <div v-if="delta?.overall != null" class="mt-1 flex items-center gap-1 text-sm font-medium" :class="deltaColor(delta.overall)">
        <UIcon :name="deltaIcon(delta.overall)" class="h-4 w-4" />
        <span>{{ formatDelta(delta.overall) }}</span>
        <span class="text-(--ui-text-muted)">{{ t('vs previous') }}</span>
      </div>
    </div>

    <!-- Category breakdown grid -->
    <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="cat in categoryData"
        :key="cat.key"
        class="rounded-xl border border-(--ui-border) bg-(--ui-bg) p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon :name="cat.icon" class="h-4 w-4 text-(--ui-text-muted)" />
            <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ cat.label }}</span>
          </div>
          <span class="text-xl font-bold tabular-nums" :class="scoreColor(cat.value)">
            {{ cat.value }}
          </span>
        </div>
        <!-- Progress bar -->
        <div class="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-(--ui-bg-accented)">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="scoreBarColor(cat.value)"
            :style="{ width: `${cat.value}%` }"
          />
        </div>
        <p class="mt-2 text-[11px] leading-tight text-(--ui-text-dimmed)">{{ cat.description }}</p>
        <div
          v-if="getCategoryDelta(cat.key) != null"
          class="mt-1.5 flex items-center gap-0.5 text-xs font-medium"
          :class="deltaColor(getCategoryDelta(cat.key))"
        >
          <UIcon :name="deltaIcon(getCategoryDelta(cat.key))" class="h-3 w-3" />
          <span>{{ formatDelta(getCategoryDelta(cat.key)) }}</span>
        </div>
      </div>
    </div>

    <!-- Score trend chart -->
    <div v-if="scoreHistory.length >= 2" class="mt-8">
      <div class="rounded-xl border border-(--ui-border) bg-(--ui-bg) p-6">
        <h3 class="mb-4 text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Score trend') }}</h3>
        <BaseLineChart
          :labels="scoreHistory.map(h => formatDate(h.created_at))"
          :values="scoreHistory.map(h => h.overall_score)"
          :height="180"
          color="emerald"
          :y-min="0"
          :y-max="100"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { scoreColor, SCORE_CATEGORIES } from '~/constants/audit'
import type { ScoreCategoryKey } from '~/constants/audit'

const props = defineProps<{
  overallScore: number
  scores: Record<string, number>
  delta: { overall: number | null, scores: Record<string, number | null> } | null
  scoreHistory: Array<{ overall_score: number, created_at: string }>
}>()

const { t } = useI18n()
const { formatDate } = useFormatters()

// Radial ring math
const radius = 88
const circumference = 2 * Math.PI * radius

// Animated score count-up
const displayScore = ref(0)
let animationFrame: number | null = null

const strokeOffset = computed(() => {
  return circumference - (displayScore.value / 100) * circumference
})

const ringColor = computed(() => {
  if (displayScore.value >= 80) return '#22c55e'
  if (displayScore.value >= 50) return '#eab308'
  return '#ef4444'
})

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

// Category data
const categoryData = computed(() => {
  return SCORE_CATEGORIES.map(cat => ({
    key: cat.key,
    icon: cat.icon,
    label: categoryLabel(cat.key),
    description: categoryDescription(cat.key),
    value: props.scores?.[cat.key] ?? 0,
  }))
})

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

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
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

function categoryDescription(key: ScoreCategoryKey): string {
  const descriptions: Record<ScoreCategoryKey, () => string> = {
    clarity: () => t('How clear and understandable your messaging is'),
    trust: () => t('How trustworthy your page appears to visitors'),
    conversion: () => t('How effectively your page drives user actions'),
    performance: () => t('Page load speed and Core Web Vitals'),
    technical: () => t('JavaScript errors, accessibility, and code quality'),
  }
  return descriptions[key]()
}
</script>
