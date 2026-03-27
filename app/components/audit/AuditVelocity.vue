<template>
  <div class="flex items-center gap-3 rounded-lg border border-(--ui-border) px-4 py-3">
    <UIcon :name="trendIcon" class="h-4 w-4 shrink-0" :class="trendColor" />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ headline }}</p>
      <p class="text-xs text-(--ui-text-muted)">{{ t('Based on {n} audits', { n: velocity.data_points }) }}</p>
    </div>
    <UTooltip :text="t('{n} pts/audit average', { n: velocity.score_per_audit > 0 ? '+' + velocity.score_per_audit : velocity.score_per_audit })">
      <span class="shrink-0 text-sm font-semibold tabular-nums" :class="trendColor">
        {{ velocity.score_per_audit > 0 ? '+' : '' }}{{ velocity.score_per_audit }}
        <span class="text-xs font-normal text-(--ui-text-muted)">{{ t('pts/audit') }}</span>
      </span>
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
export interface VelocityData {
  score_per_audit: number
  audits_to_85: number | null
  trend: 'improving' | 'stable' | 'declining'
  data_points: number
}

const props = defineProps<{ velocity: VelocityData }>()
const { t } = useI18n()

const trendIcon = computed(() => {
  if (props.velocity.trend === 'improving') return 'i-lucide-trending-up'
  if (props.velocity.trend === 'declining') return 'i-lucide-trending-down'
  return 'i-lucide-minus'
})

const trendColor = computed(() => {
  if (props.velocity.trend === 'improving') return 'text-green-500'
  if (props.velocity.trend === 'declining') return 'text-red-500'
  return 'text-(--ui-text-muted)'
})

const headline = computed(() => {
  if (props.velocity.trend === 'improving' && props.velocity.audits_to_85 !== null) {
    return t('At this pace, you\'ll reach 85+ in ~{n} audits', { n: props.velocity.audits_to_85 })
  }
  if (props.velocity.trend === 'improving') {
    return t('Score is improving — keep it up!')
  }
  if (props.velocity.trend === 'declining') {
    return t('Score is declining — review recent changes')
  }
  return t('Score is stable across recent audits')
})
</script>
