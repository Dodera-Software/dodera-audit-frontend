<template>
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <UButton
        v-if="allIssues.length > 0"
        size="md"
        icon="i-lucide-refresh-cw"
        :loading="triggeringAudit"
        @click="handleRunAudit"
      >
        {{ t('Re-audit page') }}
      </UButton>
    </Teleport>

    <div class="min-w-0 overflow-hidden">

      <!-- Kanban board -->
      <KanbanBoard
        :issues="allIssues"
        :loading="loading"
        :update-status-fn="updateIssueStatus"
        @issue-click="openDetail"
      />

      <!-- Issue detail slideover -->
      <IssueDetailSlideover
        ref="slideoverRef"
        v-model:open="slideoverOpen"
        :issue-id="selectedIssueId"
        @status-changed="onStatusChangedFromPanel"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import KanbanBoard from '~/components/board/KanbanBoard.vue'
import IssueDetailSlideover from '~/components/board/IssueDetailSlideover.vue'
import type { BoardIssue } from '~/components/board/IssueCard.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

const projectId = route.params.id as string
const pageId = route.params.pageId as string

const toast = useToast()

onMounted(async () => {
  setNavbar({
    title: t('Optimization Board'),
    showBack: true,
    backTo: `/projects/${projectId}/pages/${pageId}`,
  })

  await loadIssues()

  const issueParam = route.query.issue as string | undefined
  if (issueParam) {
    selectedIssueId.value = issueParam
    slideoverOpen.value = true
  }
})

const { confirm } = useConfirm()

const slideoverRef = ref<{ reload: () => void } | null>(null)
const allIssues = ref<BoardIssue[]>([])
const loading = ref(true)
const triggeringAudit = ref(false)
const slideoverOpen = ref(false)
const selectedIssueId = ref<string | null>(null)

async function loadIssues() {
  try {
    const data = await $api<{ data: BoardIssue[] }>(`/pages/${pageId}/issues?per_page=500`)
    allIssues.value = data.data.map(issue => ({
      ...issue,
      is_regression: false,
    }))
  }
  catch (e) {
    apiError.parse(e, t('Failed to load issues.'))
  }
  finally {
    loading.value = false
  }
}

async function updateIssueStatus(issueId: string, targetStatus: string) {
  const index = allIssues.value.findIndex(i => i.id === issueId)
  if (index === -1) return

  const previousStatus = allIssues.value[index].current_status
  allIssues.value[index] = { ...allIssues.value[index], current_status: targetStatus } as BoardIssue

  try {
    await $api(`/issues/${issueId}`, {
      method: 'PATCH',
      body: { current_status: targetStatus },
    })
  }
  catch (e) {
    allIssues.value[index] = { ...allIssues.value[index], current_status: previousStatus } as BoardIssue
    apiError.parse(e, t('Failed to update issue status.'))
    toast.add({ title: apiError.displayMessage.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    if (selectedIssueId.value === issueId && slideoverOpen.value) {
      slideoverRef.value?.reload()
    }
  }
}

async function handleRunAudit() {
  const unfixedCount = allIssues.value.filter(i => !['fixed', 'wont_fix', 'verified'].includes(i.current_status)).length

  if (unfixedCount > 0) {
    const confirmed = await confirm({
      title: t('Not all issues are fixed yet'),
      description: t('{count} issues are still open. The new audit will re-evaluate your page and compare against the current state.', { count: unfixedCount }),
      confirmLabel: t('Re-audit anyway'),
      cancelLabel: t('Cancel'),
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })

    if (!confirmed) return
  }

  triggeringAudit.value = true
  try {
    const data = await $api<{ data: { id: string } }>(`/pages/${pageId}/audits`, { method: 'POST' })
    navigateTo(`/projects/${projectId}/pages/${pageId}?audit=${data.data.id}`)
  }
  catch (e) {
    apiError.parse(e, t('Failed to start audit.'))
    toast.add({ title: apiError.displayMessage.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    triggeringAudit.value = false
  }
}

function onStatusChangedFromPanel(issueId: string, newStatus: string) {
  const index = allIssues.value.findIndex(i => i.id === issueId)
  if (index === -1) return
  allIssues.value[index] = { ...allIssues.value[index], current_status: newStatus } as BoardIssue
}

function openDetail(issue: BoardIssue) {
  selectedIssueId.value = issue.id
  slideoverOpen.value = true
}
</script>
