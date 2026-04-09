<template>
  <div
    class="group flex cursor-pointer items-center gap-4 rounded-xl border border-(--ui-border) bg-(--ui-bg) px-4 py-3.5 transition-all hover:border-(--ui-border-hover) hover:bg-(--ui-bg-elevated)"
    @click="emit('open', audit.id)"
  >
    <!-- Score ring -->
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold tabular-nums"
      :class="audit.overall_score != null ? scoreCircleClass(audit.overall_score) : 'border-(--ui-border) text-(--ui-text-dimmed)'"
    >
      {{ audit.overall_score ?? '--' }}
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span class="text-sm font-semibold text-(--ui-text-highlighted)">
          {{ formatDateTime(audit.created_at) }}
        </span>
        <span class="text-xs text-(--ui-text-dimmed)">{{ formatRelativeDate(audit.created_at) }}</span>
        <UBadge v-if="audit.is_latest" color="success" variant="subtle" size="xs">{{ t('Latest') }}</UBadge>
        <UBadge v-if="audit.status === 'failed'" color="error" variant="subtle" size="xs">{{ t('Failed') }}</UBadge>
        <span
          v-if="audit.delta != null && audit.delta !== 0"
          class="text-xs font-semibold"
          :class="audit.delta > 0 ? 'text-green-500' : 'text-red-500'"
        >
          {{ audit.delta > 0 ? '+' : '' }}{{ audit.delta }} {{ t('pts') }}
        </span>
      </div>
      <div class="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-(--ui-text-dimmed)">
        <span v-if="audit.trigger_type">{{ triggerLabel(audit.trigger_type) }}</span>
        <span v-if="audit.issues_count != null">
          {{ audit.issues_count }} {{ audit.issues_count === 1 ? t('issue') : t('issues') }}
        </span>
      </div>
    </div>

    <UIcon
      name="i-lucide-chevron-right"
      class="h-4 w-4 shrink-0 text-(--ui-text-dimmed) transition group-hover:translate-x-0.5"
    />
  </div>
</template>

<script setup lang="ts">
import { scoreCircleClass } from '~/constants/audit'

interface AuditRow {
  id: string
  status: string
  trigger_type: string
  overall_score: number | null
  issues_count: number | null
  created_at: string
  completed_at: string | null
  is_latest: boolean
  delta: number | null
}

interface Props {
  audit: AuditRow
  projectId: string
  pageId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  open: [id: string]
}>()

const { t } = useI18n()
const { formatDateTime, formatRelativeDate } = useFormatters()

const triggerLabels = computed((): Record<string, string> => ({
  manual: t('Manual'),
  scheduled: t('Scheduled'),
  api: t('API'),
}))

function triggerLabel(trigger: string): string {
  return triggerLabels.value[trigger] ?? trigger
}


</script>
