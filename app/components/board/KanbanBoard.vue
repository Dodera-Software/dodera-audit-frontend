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
    <div
      ref="boardRef"
      class="flex min-w-0 gap-4 overflow-x-auto overflow-y-hidden pb-4"
      style="height: calc(100vh - 220px)"
    >
      <div
        v-for="col in COLUMNS"
        :key="col.status"
        class="flex w-72 flex-shrink-0 flex-col"
      >
        <!-- Column header (sticky) -->
        <div class="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-(--ui-bg) pb-1">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: col.color }" />
          <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ col.label() }}</h3>
          <span class="text-xs text-(--ui-text-muted)">({{ getColumnIssues(col.status).length }})</span>
        </div>

        <!-- Droppable column (fills remaining height) -->
        <div class="flex flex-1 flex-col overflow-y-auto rounded-lg bg-(--ui-bg-elevated) p-2">
          <!-- Loading skeletons -->
          <div v-if="loading" class="space-y-2">
            <div v-for="n in (col.status === 'to_fix' ? 3 : 1)" :key="n" class="rounded-lg border border-(--ui-border) bg-(--ui-bg) p-3">
              <div class="flex gap-1.5">
                <USkeleton class="h-4 w-12" />
                <USkeleton class="h-4 w-12" />
                <USkeleton class="h-4 w-16" />
              </div>
              <USkeleton class="mt-3 h-4 w-full" />
              <USkeleton class="mt-1.5 h-4 w-3/4" />
              <div class="mt-3 flex justify-between">
                <USkeleton class="h-3 w-16" />
                <USkeleton class="h-5 w-5 rounded-full" />
              </div>
            </div>
          </div>

          <template v-else>
            <!-- Empty state pinned to top -->
            <p v-if="getColumnIssues(col.status).length === 0" class="pt-3 text-center text-xs text-(--ui-text-muted)">
              {{ col.emptyMessage() }}
            </p>

            <VueDraggable
              :model-value="columnModels[col.status] ?? []"
              group="board"
              item-key="id"
              :animation="200"
              ghost-class="opacity-30"
              :scroll="true"
              :scroll-sensitivity="100"
              :scroll-speed="15"
              class="space-y-2"
              :data-status="col.status"
              @start="startEdgeScroll"
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

            <!-- Locked issues (free plan) -->
            <div v-if="getColumnLockedIssues(col.status).length" class="mt-2 space-y-2">
              <div
                v-for="issue in getColumnLockedIssues(col.status)"
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

              <!-- Upgrade CTA at bottom of first column with locked items -->
              <button
                v-if="col.status === 'to_fix' || (col.status !== 'to_fix' && getColumnLockedIssues(col.status).length > 0)"
                class="mt-1 w-full rounded-lg border border-dashed border-(--ui-primary)/30 py-2 text-center text-xs font-medium text-(--ui-primary) transition-colors hover:border-(--ui-primary)/60 hover:bg-(--ui-primary)/5"
                @click="showUpgradeModal = true"
              >
                <UIcon name="i-lucide-zap" class="mr-1 inline h-3 w-3" />
                {{ getColumnLockedIssues(col.status).length }} {{ t('more locked') }} · {{ t('Upgrade') }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <UpgradeModal
    v-model:open="showUpgradeModal"
    :reason="t('Upgrade to see all your issues and unlock AI fix suggestions.')"
  />
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import IssueCard from '~/components/board/IssueCard.vue'
import type { BoardIssue } from '~/components/board/IssueCard.vue'
import UpgradeModal from '~/components/billing/UpgradeModal.vue'

const props = defineProps<{
  issues: BoardIssue[]
  loading?: boolean
  updateStatusFn: (issueId: string, status: string) => Promise<void>
}>()

const emit = defineEmits<{
  issueClick: [issue: BoardIssue]
}>()

const { isFree, FREE_ISSUE_LIMIT } = usePlan()
const showUpgradeModal = ref(false)

// Top N issue IDs by ROI score — always unlocked for free users
const unlockedIssueIds = computed<Set<string> | null>(() => {
  if (!isFree.value) return null
  const sorted = [...props.issues].sort((a, b) => b.roi_score - a.roi_score)
  return new Set(sorted.slice(0, FREE_ISSUE_LIMIT).map(i => i.id))
})

function isLocked(issue: BoardIssue): boolean {
  if (!unlockedIssueIds.value) return false
  return !unlockedIssueIds.value.has(issue.id)
}

const { t } = useI18n()

const COLUMNS = [
  { status: 'to_fix', color: '#ef4444', label: () => t('To Fix'), emptyMessage: () => t('No issues to fix') },
  { status: 'in_progress', color: '#3b82f6', label: () => t('In Progress'), emptyMessage: () => t('Nothing in progress') },
  { status: 'in_review', color: '#f59e0b', label: () => t('In Review'), emptyMessage: () => t('No issues in review') },
  { status: 'fixed', color: '#22c55e', label: () => t('Fixed'), emptyMessage: () => t('No fixed issues yet') },
  { status: 'verified', color: '#8b5cf6', label: () => t('Verified'), emptyMessage: () => t('No verified issues') },
  { status: 'wont_fix', color: '#9ca3af', label: () => t('Archived'), emptyMessage: () => t('No archived issues') },
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

const boardRef = ref<HTMLElement | null>(null)
let isDragging = false
let scrollInterval: ReturnType<typeof setInterval> | null = null

function startEdgeScroll() {
  if (scrollInterval) return
  scrollInterval = setInterval(() => {
    const board = boardRef.value
    if (!board) return

    const rect = board.getBoundingClientRect()
    const mouseX = lastMouseX

    if (mouseX < rect.left + 80) {
      board.scrollLeft -= 12
    }
    else if (mouseX > rect.right - 80) {
      board.scrollLeft += 12
    }
  }, 16)
}

function stopEdgeScroll() {
  if (!scrollInterval) return
  clearInterval(scrollInterval)
  scrollInterval = null
}

let lastMouseX = 0

if (import.meta.client) {
  document.addEventListener('drag', (e) => {
    if (e.clientX > 0) lastMouseX = e.clientX
  })
  document.addEventListener('dragover', (e) => {
    if (e.clientX > 0) lastMouseX = e.clientX
  })
  document.addEventListener('mousemove', (e) => {
    if (isDragging) lastMouseX = e.clientX
  })
}

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
    // Only unlocked issues go into the draggable model
    models[col.status] = getColumnIssues(col.status).filter(i => !isLocked(i))
  }
  return models
})

function getColumnLockedIssues(status: string): BoardIssue[] {
  return getColumnIssues(status).filter(i => isLocked(i))
}

interface DragEndEvent {
  item: HTMLElement
  to: HTMLElement
}

async function onDragEnd(event: DragEndEvent) {
  stopEdgeScroll()
  isDragging = true

  const itemEl = event.item
  const toEl = event.to

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
