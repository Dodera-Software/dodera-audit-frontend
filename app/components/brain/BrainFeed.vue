<template>
  <div v-if="loading" class="flex justify-center py-8">
    <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-(--ui-text-muted)" />
  </div>

  <div v-else class="space-y-5">
    <!-- First audit state -->
    <UCard v-if="!brain.progress_narrative && !brain.priority_recommendations?.length" class="border-l-4 border-l-purple-500">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-brain" class="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
        <div>
          <h3 class="font-semibold text-(--ui-text-highlighted)">{{ t('Your Brain is learning') }}</h3>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            {{ t('Run more audits to see your progress story. The Brain tracks patterns across audits and builds a narrative of your page\'s improvement journey.') }}
          </p>
        </div>
      </div>
    </UCard>

    <template v-else>
      <!-- Progress narrative + momentum -->
      <UCard v-if="brain.progress_narrative" class="border-l-4 border-l-purple-500">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-brain" class="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-(--ui-text-highlighted)">{{ t("Brain's assessment") }}</h3>
              <UBadge v-if="brain.momentum" :color="momentumColor" variant="subtle" size="xs">
                <UIcon :name="momentumIcon" class="mr-0.5 h-3 w-3" />
                {{ momentumLabel }}
              </UBadge>
            </div>
            <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--ui-text)">
              {{ brain.progress_narrative }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Regression alerts -->
      <div v-if="brain.regression_alerts?.length" class="space-y-2">
        <UAlert
          v-for="(alert, i) in brain.regression_alerts"
          :key="i"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="alert.issue_title"
          :description="alert.hypothesis"
        />
      </div>

      <!-- Priority recommendations -->
      <div v-if="brain.priority_recommendations?.length">
        <p class="mb-2 text-xs font-medium text-(--ui-text-muted)">{{ t('Priority recommendations') }}</p>
        <div class="space-y-2">
          <div
            v-for="(rec, i) in brain.priority_recommendations.slice(0, 3)"
            :key="i"
            class="flex items-start gap-2 rounded-lg bg-(--ui-bg-elevated) p-3"
          >
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--ui-primary)/10 text-xs font-bold text-(--ui-primary)">
              {{ i + 1 }}
            </span>
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ rec.title }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">{{ rec.reason }}</p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: string
}>()

const { t } = useI18n()
const { $api } = useApi()

interface BrainData {
  score_history: Array<{ overall_score: number, created_at: string }> | null
  pattern_registry: any[] | null
  momentum: string | null
  progress_narrative: string | null
  momentum_explanation: string | null
  priority_recommendations: Array<{ title: string, reason: string, effort: string }> | null
  regression_alerts: Array<{ issue_title: string, hypothesis: string }> | null
}

const brain = ref<BrainData>({
  score_history: null,
  pattern_registry: null,
  momentum: null,
  progress_narrative: null,
  momentum_explanation: null,
  priority_recommendations: null,
  regression_alerts: null,
})
const loading = ref(true)

onMounted(async () => {
  try {
    brain.value = await $api<BrainData>(`/projects/${props.projectId}/brain`)
  }
  catch {
    // Silent — brain feed is non-critical
  }
  finally {
    loading.value = false
  }
})

const MOMENTUM_CONFIG: Record<string, { color: any, icon: string, label: () => string }> = {
  improving: { color: 'success', icon: 'i-lucide-trending-up', label: () => t('Improving') },
  plateau: { color: 'warning', icon: 'i-lucide-minus', label: () => t('Plateau') },
  regressing: { color: 'error', icon: 'i-lucide-trending-down', label: () => t('Regressing') },
}

const momentumColor = computed(() => MOMENTUM_CONFIG[brain.value.momentum ?? '']?.color ?? 'neutral')
const momentumIcon = computed(() => MOMENTUM_CONFIG[brain.value.momentum ?? '']?.icon ?? 'i-lucide-minus')
const momentumLabel = computed(() => MOMENTUM_CONFIG[brain.value.momentum ?? '']?.label() ?? brain.value.momentum)
</script>
