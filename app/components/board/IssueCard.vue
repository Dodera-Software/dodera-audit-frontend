<template>
  <div
    class="group cursor-grab rounded-lg border border-(--ui-border) bg-(--ui-bg) p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-(--ui-primary) hover:shadow-md active:cursor-grabbing"
    @click="$emit('click', issue)"
  >
    <!-- Regression banner -->
    <div v-if="issue.is_regression" class="mb-2 rounded bg-amber-500/15 px-2 py-0.5 text-center text-xs font-semibold text-amber-500">
      {{ t('REGRESSION') }}
    </div>

    <!-- Badges row -->
    <div class="flex flex-wrap items-center gap-1.5">
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

    <!-- Title -->
    <p class="mt-2 line-clamp-2 text-sm font-medium text-(--ui-text-highlighted)">
      {{ issue.title }}
    </p>

    <!-- Footer -->
    <div class="mt-2 flex items-center justify-between">
      <!-- Impact score -->
      <span class="text-xs font-medium text-(--ui-text-muted)">
        {{ t('Impact') }}: {{ issue.impact_score }}
      </span>

      <!-- Persona icons -->
      <div v-if="issue.persona_source?.length" class="flex -space-x-1">
        <UTooltip v-for="persona in issue.persona_source" :key="persona" :text="personaName(persona)">
          <div
            class="flex h-5 w-5 items-center justify-center rounded-full bg-(--ui-bg-elevated) text-xs"
            :class="PERSONA_COLORS[persona] ?? 'text-(--ui-text-muted)'"
          >
            {{ personaInitial(persona) }}
          </div>
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORY_BADGE_COLORS, EFFORT_BADGE_COLORS } from '~/constants/issue'
import { SEVERITY_BADGE_COLORS } from '~/constants/severity'

export interface BoardIssue {
  id: string
  category: string
  severity: string
  effort: string
  current_status: string
  title: string
  impact_score: number
  persona_source: string[] | null
  is_regression: boolean
  created_at: string
}

defineProps<{
  issue: BoardIssue
}>()

defineEmits<{
  click: [issue: BoardIssue]
}>()

const { t } = useI18n()

const PERSONA_COLORS: Record<string, string> = {
  skeptic: 'text-amber-500',
  impulse: 'text-blue-500',
  comparison: 'text-purple-500',
}

function personaInitial(persona: string): string {
  return persona.charAt(0).toUpperCase()
}

function personaName(persona: string): string {
  const names: Record<string, () => string> = {
    skeptic: () => t('Skeptic'),
    impulse: () => t('Impulse'),
    comparison: () => t('Comparison'),
  }
  return names[persona]?.() ?? persona
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
    quick: () => t('Quick'),
    medium: () => t('Medium effort'),
    big: () => t('Big'),
  }
  return labels[effort]?.() ?? effort
}
</script>
