<template>
  <div class="flex min-h-0 flex-col" style="height: calc(100vh - 160px)">
    <!-- Toolbar -->
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <USelect v-model="filters.category" :items="categoryOptions" class="w-40" :disabled="filters.quickWins" />
      <USelect v-model="filters.severity" :items="severityOptions" class="w-36" :disabled="filters.quickWins" />
      <USelect v-model="filters.effort" :items="effortOptions" class="w-36" :disabled="filters.quickWins" />

      <UButton
        :variant="filters.quickWins ? 'solid' : 'outline'"
        :color="filters.quickWins ? 'primary' : 'neutral'"
        size="md"
        :icon="filters.quickWins ? 'i-lucide-check' : 'i-lucide-zap'"
        :aria-pressed="filters.quickWins"
        @click="filters.quickWins = !filters.quickWins"
      >
        {{ filters.quickWins ? t('Quick wins on') : t('Quick wins') }}
      </UButton>

      <USelect v-model="sortBy" :items="sortOptions" class="ml-auto w-44" />
    </div>

    <!-- Quick Wins active banner -->
    <div
      v-if="filters.quickWins"
      class="mb-3 flex items-center gap-2 rounded-lg border border-(--ui-primary)/30 bg-(--ui-primary)/5 px-3 py-2 text-xs text-(--ui-text)"
    >
      <UIcon name="i-lucide-zap" class="h-4 w-4 text-(--ui-primary)" />
      <span>{{ t('Showing only critical/high issues with quick fix effort. Other filters are paused.') }}</span>
      <button class="ml-auto font-semibold text-(--ui-primary) hover:underline" @click="filters.quickWins = false">
        {{ t('Clear') }}
      </button>
    </div>

    <!-- Board -->
    <div class="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
      <div v-for="col in columns" :key="col.status" class="flex w-80 flex-shrink-0 flex-col">
        <!-- Column header -->
        <div class="mb-2 flex items-center gap-2 px-1">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: col.color }" />
          <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ col.label }}</h3>
          <span class="text-xs text-(--ui-text-muted)">
            {{ columnLists[col.status].length + (lockedByStatus[col.status]?.length ?? 0) }}
          </span>
          <span
            v-if="col.status === 'verified'"
            class="ml-auto inline-flex items-center gap-1 rounded-full bg-(--ui-bg-elevated) px-2 py-0.5 text-[10px] font-medium text-(--ui-text-muted)"
          >
            <UIcon name="i-lucide-sparkles" class="h-3 w-3" />
            {{ t('AI only') }}
          </span>
        </div>

        <!-- Column body -->
        <div class="relative flex min-h-0 flex-1 flex-col">
          <VueDraggable
            v-model="columnLists[col.status]"
            :group="col.status === 'verified' ? VERIFIED_GROUP : BOARD_GROUP"
            :animation="180"
            ghost-class="ghost-card"
            chosen-class="chosen-card"
            drag-class="dragging-card"
            :scroll="true"
            :scroll-sensitivity="120"
            :scroll-speed="16"
            :data-status="col.status"
            class="flex min-h-[160px] flex-1 flex-col gap-2 overflow-y-auto rounded-lg border-2 border-dashed p-2 transition-colors"
            :class="dropZoneClass(col.status)"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <div
              v-for="issue in columnLists[col.status]"
              :key="issue.id"
              :data-issue-id="issue.id"
              class="cursor-grab active:cursor-grabbing"
              @click="emit('issueClick', issue)"
            >
              <IssueCard :issue="issue" />
            </div>
          </VueDraggable>

          <!-- Empty state overlay -->
          <div
            v-if="!loading && columnLists[col.status].length === 0 && (lockedByStatus[col.status]?.length ?? 0) === 0"
            class="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-(--ui-text-muted)"
          >
            <span v-if="col.status === 'verified'">{{ t('The system verifies fixed issues on the next audit.') }}</span>
            <span v-else-if="isDragging">{{ t('Drop here') }}</span>
            <span v-else>{{ col.emptyMessage }}</span>
          </div>
        </div>

        <!-- Locked issues (free plan) -->
        <div v-if="lockedByStatus[col.status]?.length" class="mt-2 space-y-2">
          <div
            v-for="issue in lockedByStatus[col.status]"
            :key="issue.id"
            class="relative cursor-pointer rounded-lg"
            @click="showUpgradeModal = true"
          >
            <div class="pointer-events-none blur-sm">
              <IssueCard :issue="issue" />
            </div>
            <div class="absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg bg-(--ui-bg)/60 backdrop-blur-[2px]">
              <UIcon name="i-lucide-lock" class="h-3.5 w-3.5 text-(--ui-primary)" />
              <span class="text-xs font-semibold text-(--ui-primary)">{{ t('Upgrade to unlock') }}</span>
            </div>
          </div>
          <button
            class="mt-1 w-full rounded-lg border border-dashed border-(--ui-primary)/30 py-2 text-center text-xs font-medium text-(--ui-primary) transition-colors hover:border-(--ui-primary)/60 hover:bg-(--ui-primary)/5"
            @click="showUpgradeModal = true"
          >
            <UIcon name="i-lucide-zap" class="mr-1 inline h-3 w-3" />
            {{ lockedByStatus[col.status]?.length ?? 0 }} {{ t('more locked') }} · {{ t('Upgrade') }}
          </button>
        </div>
      </div>
    </div>

    <UpgradeModal
      v-model:open="showUpgradeModal"
      :reason="t('Upgrade to see all your issues and unlock AI fix suggestions.')"
    />
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import IssueCard from '~/components/board/IssueCard.vue'
import type { BoardIssue } from '~/components/board/IssueCard.vue'
import UpgradeModal from '~/components/billing/UpgradeModal.vue'

interface Props {
  issues: BoardIssue[]
  loading?: boolean
  updateStatusFn: (issueId: string, status: string) => Promise<void>
}
const props = defineProps<Props>()

const emit = defineEmits<{
  issueClick: [issue: BoardIssue]
}>()

const { t } = useI18n()
const { isFree, FREE_ISSUE_LIMIT } = usePlan()

type ColumnStatus = 'to_fix' | 'in_progress' | 'in_review' | 'fixed' | 'verified' | 'wont_fix'

interface Column {
  status: ColumnStatus
  color: string
  label: string
  emptyMessage: string
}

const columns = computed<Column[]>(() => [
  { status: 'to_fix', color: '#ef4444', label: t('To Fix'), emptyMessage: t('No issues to fix') },
  { status: 'in_progress', color: '#3b82f6', label: t('In Progress'), emptyMessage: t('Nothing in progress') },
  { status: 'in_review', color: '#f59e0b', label: t('In Review'), emptyMessage: t('No issues in review') },
  { status: 'fixed', color: '#22c55e', label: t('Fixed'), emptyMessage: t('No fixed issues yet') },
  { status: 'verified', color: '#8b5cf6', label: t('Verified'), emptyMessage: t('No verified issues') },
  { status: 'wont_fix', color: '#9ca3af', label: t('Archived'), emptyMessage: t('No archived issues') },
])

const COLUMN_STATUSES: ColumnStatus[] = ['to_fix', 'in_progress', 'in_review', 'fixed', 'verified', 'wont_fix']

// Static group objects so vue-draggable-plus initialises SortableJS once.
const BOARD_GROUP = { name: 'board', pull: true, put: true }
const VERIFIED_GROUP = { name: 'board', pull: true, put: false }

const filters = reactive({
  category: 'all',
  severity: 'all',
  effort: 'all',
  quickWins: false,
})

const sortBy = ref('impact_score')

const categoryOptions = computed(() => [
  { label: t('All categories'), value: 'all' },
  { label: t('Clarity'), value: 'clarity' },
  { label: t('Trust'), value: 'trust' },
  { label: t('Conversion'), value: 'conversion' },
  { label: t('Performance'), value: 'performance' },
  { label: t('Code'), value: 'code_error' },
  { label: t('Accessibility'), value: 'accessibility' },
  { label: t('Mobile'), value: 'mobile' },
])

const severityOptions = computed(() => [
  { label: t('All severities'), value: 'all' },
  { label: t('Critical'), value: 'critical' },
  { label: t('High'), value: 'high' },
  { label: t('Medium'), value: 'medium' },
  { label: t('Low'), value: 'low' },
])

const effortOptions = computed(() => [
  { label: t('All efforts'), value: 'all' },
  { label: t('Quick'), value: 'quick' },
  { label: t('Medium effort'), value: 'medium' },
  { label: t('Big'), value: 'big' },
])

const sortOptions = computed(() => [
  { label: t('Impact score'), value: 'impact_score' },
  { label: t('Severity'), value: 'severity' },
  { label: t('Date detected'), value: 'created_at' },
])

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const showUpgradeModal = ref(false)
const isDragging = ref(false)

const unlockedIssueIds = computed<Set<string> | null>(() => {
  if (!isFree.value) return null
  const sorted = [...props.issues].sort((a, b) => b.roi_score - a.roi_score)
  return new Set(sorted.slice(0, FREE_ISSUE_LIMIT).map(i => i.id))
})

function isLocked(issue: BoardIssue): boolean {
  if (!unlockedIssueIds.value) return false
  return !unlockedIssueIds.value.has(issue.id)
}

const filteredIssues = computed(() => {
  let items = [...props.issues]

  if (filters.quickWins) {
    items = items.filter(i => ['critical', 'high'].includes(i.severity) && i.effort === 'quick')
  }
  else {
    if (filters.category !== 'all') items = items.filter(i => i.category === filters.category)
    if (filters.severity !== 'all') items = items.filter(i => i.severity === filters.severity)
    if (filters.effort !== 'all') items = items.filter(i => i.effort === filters.effort)
  }

  return items.sort((a, b) => {
    if (sortBy.value === 'severity') return (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
    if (sortBy.value === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return b.impact_score - a.impact_score
  })
})

// Per-column mutable lists bound to each VueDraggable via v-model.
// Cross-list drag is handled by vue-draggable-plus; server state flows back
// via props.issues → the watcher splices these lists in place (same array
// reference) so vue-draggable-plus's internal tracking isn't disrupted.
function emptyBuckets(): Record<ColumnStatus, BoardIssue[]> {
  return { to_fix: [], in_progress: [], in_review: [], fixed: [], verified: [], wont_fix: [] }
}

const columnLists = reactive<Record<ColumnStatus, BoardIssue[]>>(emptyBuckets())
const lockedByStatus = ref<Record<ColumnStatus, BoardIssue[]>>(emptyBuckets())

function rebuildColumnLists() {
  const unlocked = emptyBuckets()
  const locked = emptyBuckets()
  for (const issue of filteredIssues.value) {
    const bucket = isLocked(issue) ? locked : unlocked
    const status = issue.current_status as ColumnStatus
    if (status in bucket) bucket[status].push(issue)
  }
  for (const status of COLUMN_STATUSES) {
    columnLists[status].splice(0, columnLists[status].length, ...unlocked[status])
  }
  lockedByStatus.value = locked
}

watch([filteredIssues, unlockedIssueIds], rebuildColumnLists, { immediate: true, flush: 'post' })

function dropZoneClass(status: ColumnStatus): string {
  if (status === 'verified') return 'border-transparent bg-(--ui-bg-elevated)/60'
  if (isDragging.value) return 'border-(--ui-primary)/40 bg-(--ui-primary)/5'
  return 'border-transparent bg-(--ui-bg-elevated)'
}

interface DragEndEvent {
  item: HTMLElement
  to: HTMLElement
  from: HTMLElement
}

function onDragStart() {
  isDragging.value = true
}

async function onDragEnd(event: DragEndEvent) {
  isDragging.value = false

  const issueId = event.item?.dataset?.issueId
  const targetStatus = event.to?.dataset?.status
    ?? event.to?.closest<HTMLElement>('[data-status]')?.dataset.status
  if (!issueId || !targetStatus) return

  const original = props.issues.find(i => i.id === issueId)
  if (!original || original.current_status === targetStatus) return

  try {
    await props.updateStatusFn(issueId, targetStatus)
  }
  catch {
    // On failure, re-sync with server state so the revert is visible.
    rebuildColumnLists()
  }
}
</script>

<style scoped>
.ghost-card {
  opacity: 0.35;
}
.chosen-card {
  cursor: grabbing;
}
.dragging-card {
  transform: rotate(1deg) scale(1.02);
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
</style>
