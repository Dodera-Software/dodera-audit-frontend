<template>
  <div>
    <!-- Filter bar -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <USelect v-model="filters.category" :items="categoryOptions" class="w-40" />
      <USelect v-model="filters.severity" :items="severityOptions" class="w-36" />
      <USelect v-model="filters.effort" :items="effortOptions" class="w-36" />
      <UButton
        :variant="filters.quickWins ? 'solid' : 'outline'"
        size="sm"
        icon="i-lucide-zap"
        @click="filters.quickWins = !filters.quickWins"
      >
        {{ t('Quick wins') }}
      </UButton>
      <USelect v-model="sortBy" :items="sortOptions" class="ml-auto w-44" />
    </div>

    <!-- Kanban columns -->
    <div class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in COLUMNS"
        :key="col.status"
        class="w-72 flex-shrink-0"
      >
        <!-- Column header -->
        <div class="mb-3 flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: col.color }" />
          <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ col.label() }}</h3>
          <span class="text-xs text-(--ui-text-muted)">({{ getColumnIssues(col.status).length }})</span>
        </div>

        <!-- Droppable column -->
        <div class="min-h-[200px] rounded-lg bg-(--ui-bg-elevated) p-2">
          <VueDraggable
            :model-value="columnModels[col.status] ?? []"
            group="board"
            item-key="id"
            :animation="200"
            ghost-class="opacity-30"
            class="min-h-[180px] space-y-2"
            :data-status="col.status"
            @end="onDragEnd"
          >
            <div
              v-for="issue in columnModels[col.status]"
              :key="issue.id"
              :data-issue-id="issue.id"
            >
              <IssueCard
                :issue="issue"
                @click="$emit('issueClick', issue)"
              />
            </div>
          </VueDraggable>

          <!-- Empty state -->
          <div v-if="getColumnIssues(col.status).length === 0" class="py-8 text-center">
            <p class="text-xs text-(--ui-text-muted)">{{ col.emptyMessage() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import IssueCard from '~/components/board/IssueCard.vue'
import type { BoardIssue } from '~/components/board/IssueCard.vue'

const props = defineProps<{
  issues: BoardIssue[]
  updateStatusFn: (issueId: string, status: string) => Promise<void>
}>()

const emit = defineEmits<{
  issueClick: [issue: BoardIssue]
}>()

const { t } = useI18n()

const COLUMNS = [
  { status: 'to_fix', color: '#ef4444', label: () => t('To Fix'), emptyMessage: () => t('No issues to fix') },
  { status: 'in_progress', color: '#3b82f6', label: () => t('In Progress'), emptyMessage: () => t('Nothing in progress') },
  { status: 'in_review', color: '#f59e0b', label: () => t('In Review'), emptyMessage: () => t('No issues in review') },
  { status: 'fixed', color: '#22c55e', label: () => t('Fixed'), emptyMessage: () => t('No fixed issues yet') },
]

const filters = reactive({
  category: 'all',
  severity: 'all',
  effort: 'all',
  quickWins: false,
})

const sortBy = ref('impact_score')

const categoryOptions = [
  { label: t('All categories'), value: 'all' },
  { label: t('Clarity'), value: 'clarity' },
  { label: t('Trust'), value: 'trust' },
  { label: t('Conversion'), value: 'conversion' },
  { label: t('Performance'), value: 'performance' },
  { label: t('Code'), value: 'code_error' },
  { label: t('Accessibility'), value: 'accessibility' },
  { label: t('Mobile'), value: 'mobile' },
]

const severityOptions = [
  { label: t('All severities'), value: 'all' },
  { label: t('Critical'), value: 'critical' },
  { label: t('High'), value: 'high' },
  { label: t('Medium'), value: 'medium' },
  { label: t('Low'), value: 'low' },
]

const effortOptions = [
  { label: t('All efforts'), value: 'all' },
  { label: t('Quick'), value: 'quick' },
  { label: t('Medium effort'), value: 'medium' },
  { label: t('Big'), value: 'big' },
]

const sortOptions = [
  { label: t('Impact score'), value: 'impact_score' },
  { label: t('Severity'), value: 'severity' },
  { label: t('Date detected'), value: 'created_at' },
]

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

let isDragging = false

const filteredIssues = computed(() => {
  let issues = [...props.issues]

  if (filters.quickWins) {
    issues = issues.filter(i => ['critical', 'high'].includes(i.severity) && i.effort === 'quick')
  }
  else {
    if (filters.category !== 'all') issues = issues.filter(i => i.category === filters.category)
    if (filters.severity !== 'all') issues = issues.filter(i => i.severity === filters.severity)
    if (filters.effort !== 'all') issues = issues.filter(i => i.effort === filters.effort)
  }

  if (isDragging) return issues

  return issues.sort((a, b) => {
    if (sortBy.value === 'severity') return (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
    if (sortBy.value === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return b.impact_score - a.impact_score
  })
})

function getColumnIssues(status: string): BoardIssue[] {
  return filteredIssues.value.filter(i => i.current_status === status)
}

const columnModels = computed(() => {
  const models: Record<string, BoardIssue[]> = {}
  for (const col of COLUMNS) {
    models[col.status] = getColumnIssues(col.status)
  }
  return models
})

async function onDragEnd(event: any) {
  isDragging = true

  const itemEl = event.item as HTMLElement
  const toEl = event.to as HTMLElement

  const issueId = itemEl?.dataset?.issueId ?? itemEl?.querySelector('[data-issue-id]')?.getAttribute('data-issue-id')
  const targetStatus = toEl?.dataset?.status ?? toEl?.closest('[data-status]')?.getAttribute('data-status')

  if (!issueId || !targetStatus) {
    isDragging = false
    return
  }

  const issue = props.issues.find(i => i.id === issueId)
  if (!issue || issue.current_status === targetStatus) {
    isDragging = false
    return
  }

  try {
    await props.updateStatusFn(issueId, targetStatus)
  }
  finally {
    isDragging = false
  }
}
</script>
