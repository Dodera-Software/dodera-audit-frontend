<template>
  <!-- Empty state -->
  <UAlert
    v-if="issues.length === 0"
    color="success"
    variant="subtle"
    icon="i-lucide-party-popper"
    :title="t('No issues found')"
    :description="t('Your page looks great! No critical issues were detected.')"
  />

  <!-- Issues grid -->
  <div v-else class="space-y-3">
    <div
      v-for="(issue, index) in issues"
      :key="issue.id"
      class="group cursor-pointer rounded-xl border border-(--ui-border) bg-(--ui-bg) p-4 transition-all duration-300 hover:shadow-md"
      :style="{ transitionDelay: `${index * 60}ms` }"
      :class="mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
      @click="navigateTo(`/projects/${projectId}/pages/${pageId}/board?issue=${issue.id}`)"
    >
      <div class="flex items-start gap-3">
        <!-- ROI score circle (primary ranking signal) -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          :class="impactBg(issue.impact_score)"
        >
          {{ Number(issue.roi_score).toFixed(1) }}
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-(--ui-text-highlighted)">
            {{ issue.title }}
          </p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <UBadge :color="(CATEGORY_BADGE_COLORS[issue.category] as any)" variant="subtle" size="xs">
              {{ categoryLabel(issue.category) }}
            </UBadge>
            <UBadge :color="(SEVERITY_BADGE_COLORS[issue.severity] as any)" variant="soft" size="xs">
              {{ severityLabel(issue.severity) }}
            </UBadge>
            <UBadge :color="(EFFORT_BADGE_COLORS[issue.effort] as any)" variant="outline" size="xs">
              {{ effortLabel(issue.effort) }}
            </UBadge>
          </div>
        </div>

        <!-- Arrow -->
        <UIcon name="i-lucide-arrow-right" class="mt-1 h-4 w-4 shrink-0 text-(--ui-text-dimmed) transition group-hover:translate-x-0.5" />
      </div>
    </div>

    <!-- View full board -->
    <div class="pt-3 text-center">
      <UButton
        variant="soft"
        icon="i-lucide-kanban"
        :to="`/projects/${projectId}/pages/${pageId}/board`"
      >
        {{ t('View full board') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORY_BADGE_COLORS, EFFORT_BADGE_COLORS } from '~/constants/issue'
import { SEVERITY_BADGE_COLORS } from '~/constants/severity'

defineProps<{
  issues: Array<{
    id: string
    category: string
    severity: string
    effort: string
    title: string
    impact_score: number
    roi_score: number
  }>
  projectId: string
  pageId: string
}>()

const { t } = useI18n()
const mounted = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

function impactBg(score: number): string {
  if (score >= 7) return 'bg-red-500'
  if (score >= 5) return 'bg-yellow-500'
  return 'bg-blue-500'
}

function categoryLabel(category: string): string {
  const labels: Record<string, () => string> = {
    clarity: () => t('Clarity'),
    trust: () => t('Trust'),
    conversion: () => t('Conversion'),
    performance: () => t('Performance'),
    code_error: () => t('Code'),
    accessibility: () => t('Accessibility'),
    mobile: () => t('Mobile'),
  }
  return labels[category]?.() ?? category
}

function severityLabel(severity: string): string {
  const labels: Record<string, () => string> = {
    critical: () => t('Critical'),
    high: () => t('High'),
    medium: () => t('Medium'),
    low: () => t('Low'),
  }
  return labels[severity]?.() ?? severity
}

function effortLabel(effort: string): string {
  const labels: Record<string, () => string> = {
    quick: () => t('Quick fix'),
    medium: () => t('Medium effort'),
    big: () => t('Big effort'),
  }
  return labels[effort]?.() ?? effort
}
</script>
