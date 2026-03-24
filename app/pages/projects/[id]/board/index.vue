<template>
  <ClientOnly>
    <div>
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UButton variant="ghost" icon="i-lucide-arrow-left" @click="router.back()" />
          <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Optimization Board') }}</h1>
        </div>
        <UButton
          icon="i-lucide-refresh-cw"
          :loading="triggeringAudit"
          @click="handleRunAudit"
        >
          {{ t('Re-audit site') }}
        </UButton>
      </div>

      <!-- Kanban board -->
      <KanbanBoard
        :issues="allIssues"
        :loading="loading"
        :update-status-fn="updateIssueStatus"
        @issue-click="openDetail"
      />

      <!-- Issue detail slideover -->
      <IssueDetailSlideover
        v-model:open="slideoverOpen"
        :issue-id="selectedIssueId"
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
const router = useRouter()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()

const toast = useToast()
const projectId = route.params.id as string

const { confirm } = useConfirm()

const allIssues = ref<BoardIssue[]>([])
const loading = ref(true)
const triggeringAudit = ref(false)
const slideoverOpen = ref(false)
const selectedIssueId = ref<string | null>(null)

onMounted(async () => {
  await loadIssues()
})

async function loadIssues() {
  try {
    const data = await $api<{ data: BoardIssue[] }>(`/projects/${projectId}/issues?per_page=200`)
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
  allIssues.value[index] = { ...allIssues.value[index], current_status: targetStatus }

  try {
    await $api(`/issues/${issueId}`, {
      method: 'PATCH',
      body: { current_status: targetStatus },
    })
  }
  catch (e) {
    allIssues.value[index] = { ...allIssues.value[index], current_status: previousStatus }
    apiError.parse(e, t('Failed to update issue status.'))
    toast.add({ title: apiError.displayMessage.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

async function handleRunAudit() {
  const unfixedCount = allIssues.value.filter(i => !['fixed', 'wont_fix', 'verified'].includes(i.current_status)).length

  if (unfixedCount > 0) {
    const confirmed = await confirm({
      title: t('Not all issues are fixed yet'),
      description: t('{count} issues are still open. The new audit will re-evaluate your site and compare against the current state.', { count: unfixedCount }),
      confirmLabel: t('Re-audit anyway'),
      cancelLabel: t('Cancel'),
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })

    if (!confirmed) return
  }

  triggeringAudit.value = true
  try {
    const data = await $api<{ data: { id: string } }>(`/projects/${projectId}/audits`, { method: 'POST' })
    navigateTo(`/projects/${projectId}`)
  }
  catch (e) {
    apiError.parse(e, t('Failed to start audit.'))
    toast.add({ title: apiError.displayMessage.value, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    triggeringAudit.value = false
  }
}

function openDetail(issue: BoardIssue) {
  selectedIssueId.value = issue.id
  slideoverOpen.value = true
}
</script>
