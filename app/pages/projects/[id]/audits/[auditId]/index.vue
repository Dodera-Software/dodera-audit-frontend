<template>
  <ClientOnly>
    <!-- Scan in progress or just completed (before watcher sets showSuccess) -->
    <div v-if="activeScan && !showSuccess" class="absolute inset-0 flex items-center justify-center overflow-y-auto bg-(--ui-bg)">
      <ScanProgress :scan="activeScan" @retry="() => {}" />
    </div>

    <!-- Success celebration -->
    <div v-else-if="showSuccess" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-(--ui-bg)">
      <Vue3Lottie
        animation-link="/animations/success.json"
        :height="280"
        :width="280"
        :loop="false"
        :auto-play="true"
      />
      <h1 class="mt-6 text-3xl font-bold text-(--ui-text-highlighted)">{{ t('Your page audit is ready!') }}</h1>
      <p class="mt-2 text-(--ui-text-muted)">{{ t('Taking you to your results...') }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <!-- Report -->
    <div v-else-if="audit">
      <!-- Header -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Audit Report') }}</h1>
        <div class="flex items-center gap-3">
          <UTooltip :text="t('When this audit was run')">
            <div class="flex cursor-default items-center gap-1.5 rounded-lg border border-(--ui-border) px-3 py-1.5 select-none">
              <UIcon name="i-lucide-calendar" class="h-3.5 w-3.5 text-(--ui-text-dimmed)" />
              <span class="text-xs text-(--ui-text-muted)">{{ formatDateTime(audit.created_at) }}</span>
            </div>
          </UTooltip>
          <UTooltip v-if="audit.scan_duration_ms" :text="t('Time to load and capture your page')">
            <div class="flex cursor-default items-center gap-1.5 rounded-lg border border-(--ui-border) px-3 py-1.5 select-none">
              <UIcon name="i-lucide-scan" class="h-3.5 w-3.5 text-(--ui-text-dimmed)" />
              <span class="text-xs text-(--ui-text-muted)">{{ formatMs(audit.scan_duration_ms) }}</span>
            </div>
          </UTooltip>
          <UTooltip v-if="audit.analysis_duration_ms" :text="t('Time for AI agents to analyze your page')">
            <div class="flex cursor-default items-center gap-1.5 rounded-lg border border-(--ui-border) px-3 py-1.5 select-none">
              <UIcon name="i-lucide-brain" class="h-3.5 w-3.5 text-(--ui-text-dimmed)" />
              <span class="text-xs text-(--ui-text-muted)">{{ formatMs(audit.analysis_duration_ms) }}</span>
            </div>
          </UTooltip>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="audit.warnings?.length" class="mb-6 space-y-2">
        <UAlert
          v-for="(warning, i) in audit.warnings"
          :key="i"
          color="warning"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="warningTitle(warning.type)"
          :description="warning.message"
        />
      </div>

      <!-- No significant changes banner -->
      <UAlert
        v-if="audit.no_significant_changes"
        class="mb-6"
        color="info"
        variant="subtle"
        icon="i-lucide-info"
        :title="t('No significant changes detected')"
        :description="t('Your page structure looks identical to the previous audit. Any score differences are due to natural AI variance, not real changes to your page.')"
      />

      <!-- Score dashboard -->
      <ScoreDashboard
        v-if="audit.overall_score != null && audit.scores"
        :overall-score="audit.overall_score"
        :scores="audit.scores"
        :delta="delta"
        :score-history="scoreHistory"
      />

      <UCard v-else class="mt-4 py-8 text-center">
        <UIcon name="i-lucide-brain" class="mx-auto h-10 w-10 text-(--ui-text-muted)" />
        <p class="mt-3 text-sm text-(--ui-text-muted)">
          {{ t('Scores are not available for this audit.') }}
        </p>
      </UCard>

      <!-- Performance breakdown: desktop vs mobile -->
      <div v-if="audit.performance_breakdown" class="mt-10">
        <PerformanceBreakdown :breakdown="audit.performance_breakdown" />
      </div>

      <FiveSecondTest
        v-if="fiveSecondImpression"
        class="mt-10"
        :impression="fiveSecondImpression"
      />

      <AuditNarrative
        v-if="audit.brain_update"
        class="mt-6"
        :narrative="audit.brain_update?.progress_narrative ?? null"
        :momentum="audit.brain_update?.momentum ?? null"
        :is-first-audit="scoreHistory.length <= 1"
      />

      <!-- Top issues -->
      <div class="mt-12">
        <div class="mb-6 flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-(--ui-bg-accented)">
            <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-(--ui-text-muted)" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Top issues') }}</h2>
            <p class="text-xs text-(--ui-text-dimmed)">{{ t('Highest impact issues to fix first') }}</p>
          </div>
        </div>
        <TopIssuesSummary :issues="topIssues" :project-id="projectId" />
      </div>

      <!-- Persona verdicts -->
      <div v-if="personaOutputs.length" class="mt-12">
        <div class="mb-6 flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-(--ui-bg-accented)">
            <UIcon name="i-lucide-users" class="h-5 w-5 text-(--ui-text-muted)" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Persona verdicts') }}</h2>
            <p class="text-xs text-(--ui-text-dimmed)">{{ t('How different visitor types experience your page') }}</p>
          </div>
        </div>
        <div class="grid gap-6 lg:grid-cols-3">
          <PersonaCard
            v-for="persona in personaOutputs"
            :key="persona.persona"
            :persona="persona"
            :is-lowest-intent="persona.persona === lowestIntentPersona"
          />
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="py-16 text-center">
      <UIcon name="i-lucide-alert-circle" class="mx-auto h-10 w-10 text-(--ui-text-muted)" />
      <p class="mt-3 text-(--ui-text-muted)">{{ t('Audit not found.') }}</p>
      <UButton class="mt-4" variant="ghost" :to="`/projects/${projectId}`">
        {{ t('Back to project') }}
      </UButton>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'
import ScanProgress from '~/components/audit/ScanProgress.vue'
import ScoreDashboard from '~/components/audit/ScoreDashboard.vue'
import FiveSecondTest from '~/components/audit/FiveSecondTest.vue'
import AuditNarrative from '~/components/audit/AuditNarrative.vue'
import PersonaCard from '~/components/audit/PersonaCard.vue'
import TopIssuesSummary from '~/components/audit/TopIssuesSummary.vue'
import PerformanceBreakdown from '~/components/audit/PerformanceBreakdown.vue'
import type { PerformanceBreakdownData } from '~/components/audit/PerformanceBreakdown.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { formatDateTime, formatMs } = useFormatters()

const projectId = route.params.id as string
const auditId = route.params.auditId as string
const scanStore = useScanProgressStore()

interface AuditWarning {
  type: string
  message: string
  agent?: string
}

interface PersonaOutput {
  persona: string
  narrative: string
  scores: { trust: number, clarity: number, action_intent: number }
  would_convert: string
  top_issue?: string
}

interface PersonaOutputEntry {
  agent: string
  output: PersonaOutput
  tokens_used: number
  duration_ms: number
}

interface IssueItem {
  id: string
  category: string
  severity: string
  effort: string
  title: string
  impact_score: number
  roi_score: number
}

interface AuditDetail {
  id: string
  status: string
  trigger_type: string
  overall_score: number | null
  scores: Record<string, number> | null
  annotations: unknown[] | null
  persona_outputs: PersonaOutputEntry[] | null
  brain_update: {
    visual_analysis?: { impression_5sec?: string } | null
    progress_narrative?: string
    momentum?: string
  } | null
  performance_breakdown: PerformanceBreakdownData | null
  no_significant_changes: boolean
  warnings: AuditWarning[] | null
  scan_duration_ms: number | null
  analysis_duration_ms: number | null
  created_at: string
  completed_at: string | null
}

interface ScoreHistoryEntry {
  overall_score: number
  created_at: string
}

const audit = ref<AuditDetail | null>(null)
const delta = ref<{ overall: number | null, scores: Record<string, number | null> } | null>(null)
const scoreHistory = ref<ScoreHistoryEntry[]>([])
const topIssues = ref<IssueItem[]>([])
const loading = ref(true)
const showSuccess = ref(false)

// Store gives us instant access to scan state — no API call needed
const activeScan = computed(() => scanStore.scanForAudit(auditId))

onMounted(async () => {
  // Active scan still running — show progress, don't fetch report
  if (activeScan.value && activeScan.value.status === 'scanning') {
    loading.value = false
    return
  }

  // Scan just completed — clear store and load report
  if (activeScan.value && activeScan.value.status === 'complete') {
    scanStore.clearScan()
  }

  await fetchAuditData()
  loading.value = false
})

async function fetchAuditData() {
  try {
    const data = await $api<{
      data: AuditDetail
      delta: { overall: number | null, scores: Record<string, number | null> }
      score_history: ScoreHistoryEntry[]
      top_issues: IssueItem[]
    }>(`/audits/${auditId}`)

    audit.value = data.data
    delta.value = data.delta
    scoreHistory.value = data.score_history
    topIssues.value = data.top_issues
  }
  catch (e) {
    apiError.parse(e, t('Failed to load audit.'))
  }
}

// When scan completes, show success then load report
watch(() => activeScan.value?.status, async (status) => {
  if (status !== 'complete') return

  showSuccess.value = true
  await fetchAuditData()
  setTimeout(() => {
    scanStore.clearScan()
    showSuccess.value = false
  }, 2500)
})

const personaOutputs = computed<PersonaOutput[]>(() => {
  if (!audit.value?.persona_outputs) return []
  return audit.value.persona_outputs.map(entry => entry.output)
})

const lowestIntentPersona = computed<string | null>(() => {
  if (personaOutputs.value.length === 0) return null

  let lowest: PersonaOutput | null = null
  for (const p of personaOutputs.value) {
    if (!lowest || p.scores.action_intent < lowest.scores.action_intent) {
      lowest = p
    }
  }
  return lowest?.persona ?? null
})

const fiveSecondImpression = computed<string | null>(() => {
  return audit.value?.brain_update?.visual_analysis?.impression_5sec ?? null
})

const WARNING_TITLES: Record<string, () => string> = {
  screenshot_missing: () => t('Screenshot unavailable'),
  screenshot_not_found: () => t('Screenshot not found'),
  screenshot_empty: () => t('Screenshot empty'),
  screenshot_error: () => t('Screenshot error'),
  agent_failed: () => t('Agent returned an error'),
  agent_error: () => t('Agent failed'),
  brain_failed: () => t('Brain synthesis incomplete'),
  brain_error: () => t('Brain synthesis failed'),
  annotations_error: () => t('Annotations unavailable'),
}

function warningTitle(type: string): string {
  return WARNING_TITLES[type]?.() ?? t('Warning')
}
</script>
