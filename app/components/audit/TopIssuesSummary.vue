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

  <!-- Issues list -->
  <div v-else class="space-y-3">
    <div
      v-for="(issue, index) in issues"
      :key="issue.id"
      class="flex items-center gap-3 rounded-lg border border-(--ui-border) p-4 transition-all duration-300"
      :style="{ animationDelay: `${index * 80}ms` }"
      :class="mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
    >
      <!-- Category badge -->
      <UBadge :color="(CATEGORY_BADGE_COLORS[issue.category] as any)" variant="subtle" class="shrink-0">
        {{ categoryLabel(issue.category) }}
      </UBadge>

      <!-- Severity badge -->
      <UBadge :color="(SEVERITY_BADGE_COLORS[issue.severity] as any)" variant="soft" class="shrink-0">
        {{ severityLabel(issue.severity) }}
      </UBadge>

      <!-- Title -->
      <p class="min-w-0 flex-1 truncate text-sm text-(--ui-text-highlighted)">
        {{ issue.title }}
      </p>

      <!-- Effort badge -->
      <UBadge :color="(EFFORT_BADGE_COLORS[issue.effort] as any)" variant="outline" class="shrink-0">
        {{ effortLabel(issue.effort) }}
      </UBadge>

      <!-- Link to board -->
      <UButton
        variant="link"
        size="xs"
        :to="`/projects/${projectId}/board`"
        trailing-icon="i-lucide-arrow-right"
      >
        {{ t('View on board') }}
      </UButton>
    </div>

    <!-- View full board -->
    <div class="pt-2 text-center">
      <UButton
        variant="ghost"
        icon="i-lucide-kanban"
        :to="`/projects/${projectId}/board`"
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
  }>
  projectId: string
}>()

const { t } = useI18n()
const mounted = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

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
