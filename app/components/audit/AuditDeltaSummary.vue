<template>
  <UCard>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <!-- Score delta -->
      <div v-if="scoreDelta !== null" class="flex items-center gap-2">
        <UIcon name="i-lucide-gauge" class="h-4 w-4 shrink-0 text-(--ui-text-dimmed)" />
        <span class="text-sm text-(--ui-text-muted)">
          {{ t('Score') }}
          <span class="font-semibold text-(--ui-text-highlighted)">{{ previousScore }} → {{ currentScore }}</span>
        </span>
        <UBadge :color="scoreDeltaColor" variant="subtle" size="sm">
          {{ scoreDeltaFormatted }}
        </UBadge>
      </div>

      <div v-if="scoreDelta !== null" class="hidden h-4 w-px bg-(--ui-border) sm:block" />

      <!-- Issue pills -->
      <div class="flex flex-wrap items-center gap-2">
        <UBadge v-if="summary.issues_fixed > 0" color="success" variant="subtle" size="sm">
          <UIcon name="i-lucide-check-circle" class="mr-1 h-3 w-3" />
          {{ t('{n} fixed', { n: summary.issues_fixed }) }}
        </UBadge>

        <UBadge v-if="summary.issues_new > 0" color="error" variant="subtle" size="sm">
          <UIcon name="i-lucide-plus-circle" class="mr-1 h-3 w-3" />
          {{ t('{n} new', { n: summary.issues_new }) }}
        </UBadge>

        <UBadge v-if="summary.issues_regressed > 0" color="warning" variant="subtle" size="sm">
          <UIcon name="i-lucide-rotate-ccw" class="mr-1 h-3 w-3" />
          {{ t('{n} regressed', { n: summary.issues_regressed }) }}
        </UBadge>

        <UBadge v-if="summary.issues_unchanged > 0" color="neutral" variant="subtle" size="sm">
          <UIcon name="i-lucide-minus-circle" class="mr-1 h-3 w-3" />
          {{ t('{n} unchanged', { n: summary.issues_unchanged }) }}
        </UBadge>

        <span v-if="allZero" class="text-sm text-(--ui-text-dimmed)">
          {{ t('No issue changes in this audit') }}
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
export interface DeltaSummary {
  issues_new: number
  issues_regressed: number
  issues_unchanged: number
  issues_fixed: number
}

const props = defineProps<{
  summary: DeltaSummary
  scoreDelta: number | null
  currentScore: number | null
}>()

const { t } = useI18n()

const previousScore = computed(() => {
  if (props.currentScore === null || props.scoreDelta === null) return null
  return props.currentScore - props.scoreDelta
})

const scoreDeltaFormatted = computed(() => {
  if (props.scoreDelta === null) return ''
  return props.scoreDelta > 0 ? `+${props.scoreDelta}` : String(props.scoreDelta)
})

const scoreDeltaColor = computed(() => {
  if (props.scoreDelta === null || props.scoreDelta === 0) return 'neutral'
  return props.scoreDelta > 0 ? 'success' : 'error'
})

const allZero = computed(() =>
  props.summary.issues_fixed === 0
  && props.summary.issues_new === 0
  && props.summary.issues_regressed === 0
  && props.summary.issues_unchanged === 0,
)
</script>
