<template>
  <BaseSlideover v-model:open="open">
    <template #title>{{ t('Issue detail') }}</template>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else-if="issue" class="space-y-5">
      <!-- Badges -->
      <div class="flex flex-wrap gap-2">
        <UBadge :color="(CATEGORY_BADGE_COLORS[issue.category] as any)" variant="subtle">
          {{ issue.category }}
        </UBadge>
        <UBadge :color="(SEVERITY_BADGE_COLORS[issue.severity] as any)" variant="soft">
          {{ issue.severity }}
        </UBadge>
        <UBadge :color="(EFFORT_BADGE_COLORS[issue.effort] as any)" variant="outline">
          {{ issue.effort }}
        </UBadge>
      </div>

      <!-- Title -->
      <h3 class="text-base font-semibold text-(--ui-text-highlighted)">{{ issue.title }}</h3>

      <!-- Description -->
      <div v-if="issue.description">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Description') }}</p>
        <p class="mt-1 text-sm text-(--ui-text)">{{ issue.description }}</p>
      </div>

      <!-- Impact -->
      <div class="flex gap-6">
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Impact score') }}</p>
          <p class="mt-0.5 text-lg font-bold text-(--ui-text-highlighted)">{{ issue.impact_score }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Status') }}</p>
          <p class="mt-0.5 text-sm font-medium capitalize text-(--ui-text-highlighted)">{{ issue.current_status.replace('_', ' ') }}</p>
        </div>
      </div>

      <!-- Persona quote -->
      <div v-if="issue.persona_quote">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Persona quote') }}</p>
        <blockquote class="mt-1 border-l-2 border-(--ui-primary) pl-3 text-sm italic text-(--ui-text-muted)">
          "{{ issue.persona_quote }}"
        </blockquote>
        <div v-if="issue.persona_source?.length" class="mt-1 text-xs text-(--ui-text-muted)">
          — {{ issue.persona_source.join(', ') }}
        </div>
      </div>

      <!-- Fix steps -->
      <div v-if="issue.fix_steps?.length">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Fix steps') }}</p>
        <ol class="mt-1 list-inside list-decimal space-y-1 text-sm text-(--ui-text)">
          <li v-for="(step, i) in issue.fix_steps" :key="i">{{ step }}</li>
        </ol>
      </div>

      <!-- AI suggestion -->
      <div v-if="issue.ai_suggestion">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('AI suggestion') }}</p>
        <p class="mt-1 text-sm text-(--ui-text)">{{ issue.ai_suggestion }}</p>
      </div>

      <!-- Element reference -->
      <div v-if="issue.element_reference">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Element') }}</p>
        <p class="mt-1 rounded bg-(--ui-bg-elevated) px-2 py-1 text-sm text-(--ui-text-highlighted)">{{ formatElementReference(issue.element_reference) }}</p>
      </div>

      <!-- Occurrences -->
      <div v-if="issue.occurrences?.length">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Audit history') }}</p>
        <div class="mt-1 space-y-1">
          <div
            v-for="occ in issue.occurrences"
            :key="occ.audit_id"
            class="flex items-center justify-between rounded bg-(--ui-bg-elevated) px-2 py-1.5 text-xs"
          >
            <span class="text-(--ui-text-muted)">{{ occ.created_at ? formatDateTime(occ.created_at) : occ.audit_id.slice(0, 8) }}</span>
            <span class="capitalize text-(--ui-text-highlighted)">{{ occ.status_at_time.replace('_', ' ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseSlideover>
</template>

<script setup lang="ts">
import { CATEGORY_BADGE_COLORS, EFFORT_BADGE_COLORS } from '~/constants/issue'
import { SEVERITY_BADGE_COLORS } from '~/constants/severity'

const props = defineProps<{
  issueId: string | null
}>()

const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()
const { $api } = useApi()
const { formatDateTime } = useFormatters()

interface IssueDetail {
  id: string
  category: string
  severity: string
  effort: string
  current_status: string
  title: string
  description: string
  impact_score: number
  element_reference: string | null
  element_bounding_box: any | null
  persona_source: string[] | null
  persona_quote: string | null
  fix_steps: string[] | null
  ai_suggestion: string | null
  last_status_changed_at: string | null
  created_at: string
  occurrences: Array<{ audit_id: string, status_at_time: string, created_at: string | null }> | null
}

const issue = ref<IssueDetail | null>(null)
const loading = ref(false)

function formatElementReference(ref: string): string {
  return ref
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

watch(() => props.issueId, async (id) => {
  if (!id) return
  loading.value = true
  try {
    const data = await $api<{ data: IssueDetail }>(`/issues/${id}`)
    issue.value = data.data
  }
  catch {
    issue.value = null
  }
  finally {
    loading.value = false
  }
}, { immediate: true })
</script>
