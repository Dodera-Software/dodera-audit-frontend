<template>
  <BaseSlideover v-model:open="open">
    <template #title>{{ t('Issue detail') }}</template>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else-if="issue" class="space-y-5">
      <!-- Verified banner -->
      <div v-if="issue.current_status === 'verified'" class="rounded-lg bg-green-500/10 p-3 text-center">
        <UIcon name="i-lucide-shield-check" class="mx-auto h-6 w-6 text-green-500" />
        <p class="mt-1 text-sm font-semibold text-green-600">{{ t('Verified fixed') }}</p>
        <p v-if="issue.last_status_changed_at" class="text-xs text-green-500">
          {{ formatDateTime(issue.last_status_changed_at) }}
        </p>
      </div>

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

      <!-- Description -->
      <div class="rounded-lg bg-(--ui-bg-elevated) p-3">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('What was found') }}</p>
        <p class="mt-1 text-sm leading-relaxed text-(--ui-text-highlighted)">{{ issue.description || issue.title }}</p>
      </div>

      <!-- Metadata row -->
      <div class="flex gap-6">
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('ROI') }}</p>
          <p class="mt-0.5 text-lg font-bold text-(--ui-text-highlighted)">{{ issue.roi_score }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Impact') }}</p>
          <p class="mt-0.5 text-sm font-medium text-(--ui-text-highlighted)">{{ issue.impact_score }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Status') }}</p>
          <p class="mt-0.5 text-sm font-medium capitalize text-(--ui-text-highlighted)">
            {{ issue.current_status.replace(/_/g, ' ') }}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('First detected') }}</p>
          <p class="mt-0.5 text-sm text-(--ui-text-highlighted)">{{ formatDate(issue.created_at) }}</p>
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
        <UCard class="border-l-4 border-l-blue-500">
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-sparkles" class="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <div>
              <p class="text-xs font-semibold text-blue-500">{{ t('AI recommends') }}</p>
              <p class="mt-1 text-sm text-(--ui-text)">{{ issue.ai_suggestion }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Element reference -->
      <div v-if="issue.element_reference">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Element') }}</p>
        <p class="mt-1 rounded bg-(--ui-bg-elevated) px-2 py-1 text-sm text-(--ui-text-highlighted)">
          {{ formatElementReference(issue.element_reference) }}
        </p>
      </div>

      <!-- Status timeline -->
      <div v-if="issue.status_history?.length">
        <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Timeline') }}</p>
        <div class="mt-2 space-y-0">
          <div
            v-for="(entry, i) in issue.status_history"
            :key="i"
            class="flex items-start gap-3 pb-3"
          >
            <!-- Timeline dot + line -->
            <div class="flex flex-col items-center">
              <div class="h-2 w-2 rounded-full" :class="timelineDotColor(entry.to_status)" />
              <div v-if="i < issue.status_history.length - 1" class="mt-1 w-px flex-1 bg-(--ui-border)" />
            </div>
            <!-- Content -->
            <div class="-mt-1 flex-1">
              <p class="text-xs text-(--ui-text-highlighted)">
                <span v-if="entry.from_status" class="capitalize">{{ entry.from_status.replace(/_/g, ' ') }}</span>
                <span v-if="entry.from_status"> → </span>
                <span class="font-medium capitalize">{{ entry.to_status.replace(/_/g, ' ') }}</span>
              </p>
              <p class="text-xs text-(--ui-text-muted)">
                {{ entry.created_at ? formatDateTime(entry.created_at) : '' }}
                <span v-if="entry.trigger === 'audit'" class="ml-1 text-blue-500">{{ t('via audit') }}</span>
                <span v-else class="ml-1">{{ t('manual') }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <template v-if="issue && issue.current_status !== 'verified'" #footer>
      <div class="space-y-2">
        <div class="grid grid-cols-3 gap-2">
          <UButton
            v-if="issue.current_status !== 'in_progress'"
            variant="outline"
            size="sm"
            icon="i-lucide-play"
            block
            :loading="updating"
            @click="changeStatus('in_progress')"
          >
            {{ t('In Progress') }}
          </UButton>
          <UButton
            v-if="issue.current_status !== 'in_review'"
            variant="outline"
            size="sm"
            icon="i-lucide-eye"
            block
            :loading="updating"
            @click="changeStatus('in_review')"
          >
            {{ t('In Review') }}
          </UButton>
          <UButton
            v-if="issue.current_status !== 'fixed'"
            color="success"
            variant="soft"
            size="sm"
            icon="i-lucide-check"
            block
            :loading="updating"
            @click="changeStatus('fixed')"
          >
            {{ t('Mark fixed') }}
          </UButton>
        </div>
        <UButton
          v-if="issue.current_status !== 'wont_fix'"
          variant="ghost"
          size="xs"
          color="neutral"
          block
          :loading="updating"
          @click="changeStatus('wont_fix')"
        >
          {{ t("Dismiss this issue") }}
        </UButton>
      </div>
    </template>
  </BaseSlideover>
</template>

<script setup lang="ts">
import { CATEGORY_BADGE_COLORS, EFFORT_BADGE_COLORS } from '~/constants/issue'
import { SEVERITY_BADGE_COLORS } from '~/constants/severity'

const props = defineProps<{
  issueId: string | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  statusChanged: [issueId: string, newStatus: string]
}>()

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const apiError = useApiError()
const { formatDate, formatDateTime } = useFormatters()

interface IssueDetail {
  id: string
  category: string
  severity: string
  effort: string
  current_status: string
  title: string
  description: string
  impact_score: number
  roi_score: number
  element_reference: string | null
  element_bounding_box: any | null
  persona_source: string[] | null
  persona_quote: string | null
  fix_steps: string[] | null
  ai_suggestion: string | null
  last_status_changed_at: string | null
  created_at: string
  occurrences: Array<{ audit_id: string, status_at_time: string, created_at: string | null }> | null
  status_history: Array<{ from_status: string | null, to_status: string, trigger: string, audit_id: string | null, created_at: string | null }> | null
}

const issue = ref<IssueDetail | null>(null)
const loading = ref(false)
const updating = ref(false)

function timelineDotColor(status: string): string {
  const colors: Record<string, string> = {
    to_fix: 'bg-red-500',
    in_progress: 'bg-blue-500',
    in_review: 'bg-amber-500',
    fixed: 'bg-green-500',
    verified: 'bg-purple-500',
    wont_fix: 'bg-gray-400',
  }
  return colors[status] ?? 'bg-gray-400'
}

function formatElementReference(ref: string): string {
  return ref
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function changeStatus(newStatus: string) {
  if (!issue.value) return
  updating.value = true

  try {
    await $api(`/issues/${issue.value.id}`, {
      method: 'PATCH',
      body: { current_status: newStatus },
    })
    emit('statusChanged', issue.value.id, newStatus)

    // Reload full issue to get updated timeline
    const fresh = await $api<{ data: IssueDetail }>(`/issues/${issue.value.id}`)
    issue.value = fresh.data
  }
  catch (e) {
    apiError.parse(e, t('Failed to update status.'))
    toast.add({ title: apiError.displayMessage.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    updating.value = false
  }
}

async function loadIssue() {
  if (!props.issueId) return
  loading.value = true
  try {
    const data = await $api<{ data: IssueDetail }>(`/issues/${props.issueId}`)
    issue.value = data.data
  }
  catch {
    issue.value = null
  }
  finally {
    loading.value = false
  }
}

watch([() => props.issueId, open], ([id, isOpen], [prevId]) => {
  if (!isOpen || !id) return
  if (id === prevId && isOpen) {
    // Same issue re-opened — reload for fresh timeline
    loadIssue()
    return
  }
  if (id !== prevId) {
    loadIssue()
  }
}, { immediate: true })

defineExpose({ reload: loadIssue })
</script>
