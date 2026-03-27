<template>
  <div>
    <!-- Header -->
    <div class="mb-4 flex items-start justify-between">
      <div>
        <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Performance') }}</h2>
        <p class="text-xs text-(--ui-text-dimmed)">
          {{ hasMobile ? t('Scored as mobile ×0.6 + desktop ×0.4 (Google mobile-first indexing)') : t('Desktop metrics only — mobile data unavailable') }}
        </p>
      </div>
    </div>

    <!-- Viewport columns -->
    <div class="overflow-hidden rounded-xl border border-(--ui-border)">
      <!-- Column headers -->
      <div class="grid border-b border-(--ui-border) bg-(--ui-bg-elevated)" :class="hasMobile ? 'grid-cols-3' : 'grid-cols-2'">
        <div class="px-4 py-3 text-xs font-medium text-(--ui-text-muted)">{{ t('Metric') }}</div>
        <div class="flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-(--ui-text-muted)">
          <UIcon name="i-lucide-monitor" class="h-3.5 w-3.5" />
          {{ t('Desktop') }}
          <UBadge v-if="hasMobile" color="neutral" variant="subtle" size="xs">×0.4</UBadge>
        </div>
        <div v-if="hasMobile" class="flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-(--ui-text-muted)">
          <UIcon name="i-lucide-smartphone" class="h-3.5 w-3.5" />
          {{ t('Mobile') }}
          <UBadge color="primary" variant="subtle" size="xs">×0.6</UBadge>
        </div>
      </div>

      <!-- Metric rows -->
      <div
        v-for="metric in metrics"
        :key="metric.key"
        class="grid border-b border-(--ui-border) last:border-0 odd:bg-(--ui-bg) even:bg-(--ui-bg-elevated)/40"
        :class="hasMobile ? 'grid-cols-3' : 'grid-cols-2'"
      >
        <!-- Metric label -->
        <div class="flex items-center gap-2 px-4 py-3">
          <span class="text-xs font-medium text-(--ui-text)">{{ metric.label }}</span>
          <UTooltip :text="metric.description">
            <UIcon name="i-lucide-info" class="h-3 w-3 text-(--ui-text-dimmed)" />
          </UTooltip>
        </div>

        <!-- Desktop value -->
        <div class="flex items-center gap-2 px-4 py-3">
          <template v-if="metricValue(breakdown.desktop, metric.key) != null">
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              :class="ratingDot(ratingValue(breakdown.desktop, metric.ratingKey))"
            />
            <span class="text-sm font-medium text-(--ui-text-highlighted)">
              {{ formatMetric(metricValue(breakdown.desktop, metric.key), metric.format) }}
            </span>
          </template>
          <span v-else class="text-xs text-(--ui-text-dimmed)">—</span>
        </div>

        <!-- Mobile value -->
        <div v-if="hasMobile" class="flex items-center gap-2 px-4 py-3">
          <template v-if="metricValue(breakdown.mobile, metric.key) != null">
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              :class="ratingDot(ratingValue(breakdown.mobile, metric.ratingKey))"
            />
            <span class="text-sm font-medium text-(--ui-text-highlighted)">
              {{ formatMetric(metricValue(breakdown.mobile, metric.key), metric.format) }}
            </span>
            <!-- Worse than desktop indicator -->
            <UIcon
              v-if="isMobileWorse(metric.key)"
              name="i-lucide-arrow-up"
              class="h-3 w-3 text-red-500"
            />
          </template>
          <span v-else class="text-xs text-(--ui-text-dimmed)">—</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ViewportMetrics {
  lcp: number | null
  cls: number | null
  ttfb: number | null
  fcp: number | null
  total_load: number | null
  lcp_rating: string | null
  cls_rating: string | null
  ttfb_rating: string | null
  [key: string]: number | string | null
}

export interface PerformanceBreakdownData {
  desktop: ViewportMetrics | null
  mobile: ViewportMetrics | null
}

const props = defineProps<{
  breakdown: PerformanceBreakdownData
}>()

const { t } = useI18n()

const hasMobile = computed(() => props.breakdown.mobile !== null)

const metrics = computed(() => [
  {
    key: 'lcp',
    ratingKey: 'lcp_rating',
    label: 'LCP',
    description: t('Largest Contentful Paint — time until the main content is visible'),
    format: 'ms',
  },
  {
    key: 'ttfb',
    ratingKey: 'ttfb_rating',
    label: 'TTFB',
    description: t('Time to First Byte — server response speed'),
    format: 'ms',
  },
  {
    key: 'fcp',
    ratingKey: null as string | null,
    label: 'FCP',
    description: t('First Contentful Paint — when the first content appears'),
    format: 'ms',
  },
  {
    key: 'cls',
    ratingKey: 'cls_rating',
    label: 'CLS',
    description: t('Cumulative Layout Shift — visual stability of the page'),
    format: 'cls',
  },
  {
    key: 'total_load',
    ratingKey: null as string | null,
    label: t('Total load'),
    description: t('Total page load time'),
    format: 'ms',
  },
])

/** Safely read a numeric metric value from a viewport. */
function metricValue(viewport: ViewportMetrics | null | undefined, key: string): number | null {
  if (!viewport) return null
  const v = viewport[key]
  return typeof v === 'number' ? v : null
}

/** Safely read a rating string from a viewport (ratingKey may be null). */
function ratingValue(viewport: ViewportMetrics | null | undefined, ratingKey: string | null): string | null {
  if (!viewport || !ratingKey) return null
  const v = viewport[ratingKey]
  return typeof v === 'string' ? v : null
}

function ratingDot(rating: string | null): string {
  if (rating === 'good') return 'bg-green-500'
  if (rating === 'needs-improvement') return 'bg-amber-500'
  if (rating === 'poor') return 'bg-red-500'
  return 'bg-(--ui-border)'
}

function formatMetric(value: number | null, format: string): string {
  if (value === null) return '—'
  if (format === 'cls') return Number(value).toFixed(3)
  return `${Math.round(Number(value))} ms`
}

function isMobileWorse(key: string): boolean {
  const d = metricValue(props.breakdown.desktop, key)
  const m = metricValue(props.breakdown.mobile, key)
  if (d == null || m == null) return false
  return m > d * 1.2
}
</script>
