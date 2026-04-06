<template>
  <ClientOnly>
    <!-- Scan in progress or just completed (before watcher sets showSuccess) -->
    <div v-if="activeScan && !showSuccess" class="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-(--ui-bg)">
      <ScanProgress :scan="activeScan" @retry="navigateTo(`/projects/${projectId}/pages/${pageId}`)" />
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

    <AuditReportSkeleton v-else-if="loading" />

    <!-- Report -->
    <div v-else-if="audit">
      <Teleport to="#navbar-actions">
        <UButton variant="outline" size="lg" icon="i-lucide-refresh-cw" @click="showRescanModal = true">
          {{ t('Re-scan') }}
        </UButton>
      </Teleport>

      <!-- Audit metadata chips -->
      <div class="mb-8 flex flex-wrap items-center gap-2">
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
        <UTooltip v-if="audit.tokens_used" :text="t('AI tokens consumed by this audit')">
          <div class="flex cursor-default items-center gap-1.5 rounded-lg border border-(--ui-border) px-3 py-1.5 select-none">
            <UIcon name="i-lucide-coins" class="h-3.5 w-3.5 text-(--ui-text-dimmed)" />
            <span class="text-xs text-(--ui-text-muted)">{{ audit.tokens_used.toLocaleString() }} {{ t('tokens') }}</span>
          </div>
        </UTooltip>
      </div>

      <QuickRescanModal v-model="showRescanModal" :page-id="pageId" :open-issue-count="openIssuesCount" @started="handleRescanStarted" />

      <!-- Warnings -->
      <div v-if="audit.warnings?.length" class="mb-6 space-y-2">
        <UAlert
          v-for="(warning, i) in audit.warnings"
          :key="i"
          :color="warningColor(warning.type)"
          variant="subtle"
          :icon="warningIcon(warning.type)"
          :title="warningTitle(warning.type)"
          :description="warningDescription(warning.type)"
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

      <!-- Velocity -->
      <div v-if="velocity" class="mt-4">
        <AuditVelocity :velocity="velocity" />
      </div>

      <!-- Delta summary: what changed vs previous audit (hide on first audit) -->
      <div v-if="audit.delta_summary && scoreHistory.length > 1" class="mt-6">
        <AuditDeltaSummary
          :summary="audit.delta_summary"
          :score-delta="delta?.overall ?? null"
          :current-score="audit.overall_score"
        />
      </div>

      <!-- Performance breakdown: desktop vs mobile -->
      <div v-if="audit.performance_breakdown" class="mt-10">
        <PerformanceBreakdown :breakdown="audit.performance_breakdown" />
      </div>

      <FiveSecondTest
        v-if="fiveSecondImpression"
        class="mt-10"
        :impression="fiveSecondImpression"
      />

      <PlanGate
        v-if="audit.brain_update"
        class="mt-6"
        :locked="isFree"
        :title="t('Page Brain narrative')"
        :description="t('AI-generated progress story tracking your page\'s improvement over time.')"
        @upgrade="showUpgradeModal = true"
      >
        <AuditNarrative
          :narrative="audit.brain_update?.progress_narrative ?? null"
          :momentum="audit.brain_update?.momentum ?? null"
          :is-first-audit="scoreHistory.length <= 1"
        />
      </PlanGate>

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
        <TopIssuesSummary :issues="topIssues" :project-id="projectId" :page-id="pageId" />
      </div>

      <!-- Persona verdicts -->
      <div v-if="personaOutputs.length" class="mt-12">
        <div class="mb-6 flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-(--ui-bg-accented)">
            <UIcon name="i-lucide-users" class="h-5 w-5 text-(--ui-text-muted)" />
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Persona verdicts') }}</h2>
            <p class="text-xs text-(--ui-text-dimmed)">{{ t('How different visitor types experience your page') }}</p>
          </div>
          <UBadge v-if="isFree" color="warning" variant="subtle" size="xs" icon="i-lucide-lock">
            {{ t('Pro feature') }}
          </UBadge>
        </div>
        <PlanGate
          :locked="isFree"
          :title="t('Persona insights')"
          :description="t('See how the Skeptic, Impulse Visitor, and Comparison Shopper experience your page.')"
          @upgrade="showUpgradeModal = true"
        >
          <div class="grid gap-6 lg:grid-cols-3">
            <PersonaCard
              v-for="persona in personaOutputs"
              :key="persona.persona"
              :persona="persona"
              :is-lowest-intent="persona.persona === lowestIntentPersona"
            />
          </div>
        </PlanGate>
      </div>

      <UpgradeModal
        v-model:open="showUpgradeModal"
        :reason="t('Upgrade to unlock persona verdicts, AI fix suggestions, and Page Brain insights.')"
      />
    </div>

    <!-- Not found -->
    <div v-else class="py-16 text-center">
      <UIcon name="i-lucide-alert-circle" class="mx-auto h-10 w-10 text-(--ui-text-muted)" />
      <p class="mt-3 text-(--ui-text-muted)">{{ t('Audit not found.') }}</p>
      <UButton class="mt-4" variant="ghost" :to="`/projects/${projectId}/pages/${pageId}`">
        {{ t('Back to page') }}
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
import AuditDeltaSummary from '~/components/audit/AuditDeltaSummary.vue'
import type { DeltaSummary } from '~/components/audit/AuditDeltaSummary.vue'
import AuditVelocity from '~/components/audit/AuditVelocity.vue'
import type { VelocityData } from '~/components/audit/AuditVelocity.vue'
import QuickRescanModal from '~/components/audit/QuickRescanModal.vue'
import PlanGate from '~/components/billing/PlanGate.vue'
import UpgradeModal from '~/components/billing/UpgradeModal.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { formatDateTime, formatMs } = useFormatters()
const { isFree } = usePlan()
const { setNavbar } = usePageNavbar()

const projectId = route.params.id as string
const pageId = route.params.pageId as string
const auditId = route.params.auditId as string
const scanStore = useScanProgressStore()
const showUpgradeModal = ref(false)

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
  confidence?: number
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
  delta_summary: DeltaSummary | null
  no_significant_changes: boolean
  warnings: AuditWarning[] | null
  tokens_used: number | null
  changed_categories: string[] | null
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
const openIssuesCount = ref(0)
const velocity = ref<VelocityData | null>(null)
const loading = ref(true)
const showSuccess = ref(false)
const showRescanModal = ref(false)

const activeScan = computed(() => scanStore.scanForAudit(auditId))

watchEffect(() => {
  setNavbar({
    title: t('Audit Report'),
    showBack: true,
    backTo: `/projects/${projectId}/pages/${pageId}`,
    hidden: !!(activeScan.value) || showSuccess.value,
  })
})

onMounted(async () => {
  if (activeScan.value && activeScan.value.status === 'scanning') {
    loading.value = false
    return
  }

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
      open_issues_count: number
      velocity: VelocityData | null
    }>(`/audits/${auditId}`)

    audit.value = data.data
    delta.value = data.delta
    scoreHistory.value = data.score_history
    topIssues.value = data.top_issues
    openIssuesCount.value = data.open_issues_count ?? 0
    velocity.value = data.velocity ?? null
  }
  catch (e) {
    apiError.parse(e, t('Failed to load audit.'))
  }
}

function handleRescanStarted(newAuditId: string) {
  navigateTo(`/projects/${projectId}/pages/${pageId}/audits/${newAuditId}`)
}

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

type WarningColor = 'warning' | 'info'

const WARNING_TITLES: Record<string, () => string> = {
  screenshot_missing: () => t('Screenshot unavailable'),
  screenshot_not_found: () => t('Screenshot unavailable'),
  screenshot_empty: () => t('Screenshot unavailable'),
  screenshot_error: () => t('Screenshot unavailable'),
  agent_failed: () => t('Partial analysis'),
  agent_error: () => t('Partial analysis'),
  scoring_degraded: () => t('Scores may vary slightly'),
  low_grounding: () => t('Analysis refined for accuracy'),
  low_grounding_final: () => t('Some insights are generalised'),
  brain_failed: () => t('AI narrative unavailable'),
  brain_error: () => t('AI narrative unavailable'),
  annotations_error: () => t('Visual annotations unavailable'),
  context_truncated: () => t('Large page — focused analysis'),
  failure: () => t('Some data is missing'),
}

const WARNING_DESCRIPTIONS: Record<string, () => string> = {
  screenshot_missing: () => t('We couldn\'t capture a screenshot of your page. Visual analysis may be limited, but your scores are still based on the page content.'),
  screenshot_not_found: () => t('We couldn\'t capture a screenshot of your page. Visual analysis may be limited, but your scores are still based on the page content.'),
  screenshot_empty: () => t('We couldn\'t capture a screenshot of your page. Visual analysis may be limited, but your scores are still based on the page content.'),
  screenshot_error: () => t('We couldn\'t capture a screenshot of your page. Visual analysis may be limited, but your scores are still based on the page content.'),
  agent_failed: () => t('One AI agent had trouble completing its analysis. Some insights may be missing, but your overall score is still reliable.'),
  agent_error: () => t('One AI agent had trouble completing its analysis. Some insights may be missing, but your overall score is still reliable.'),
  scoring_degraded: () => t('Scores for this audit are slightly less precise than usual due to a partial analysis. Your results are still a good reflection of your page.'),
  low_grounding: () => t('One analysis was re-run to improve accuracy. Your results reflect the best available output.'),
  low_grounding_final: () => t('Some observations may be broader than usual. Your core scores and top issues are unaffected.'),
  brain_failed: () => t('The AI progress narrative couldn\'t be generated for this audit. Your scores and issues are complete.'),
  brain_error: () => t('The AI progress narrative couldn\'t be generated for this audit. Your scores and issues are complete.'),
  annotations_error: () => t('Screenshot annotations are unavailable for this audit. All other analysis completed successfully.'),
  context_truncated: () => t('Your page is quite large, so the analysis focused on the most important sections. Key issues and scores are accurate.'),
  failure: () => t('Part of this audit couldn\'t be completed. Some sections may be missing or incomplete.'),
}

const WARNING_COLORS: Record<string, WarningColor> = {
  screenshot_missing: 'warning',
  screenshot_not_found: 'warning',
  screenshot_empty: 'warning',
  screenshot_error: 'warning',
  agent_failed: 'warning',
  agent_error: 'warning',
  scoring_degraded: 'info',
  low_grounding: 'info',
  low_grounding_final: 'info',
  brain_failed: 'warning',
  brain_error: 'warning',
  annotations_error: 'info',
  context_truncated: 'info',
  failure: 'warning',
}

function warningTitle(type: string): string {
  return WARNING_TITLES[type]?.() ?? t('Something to note')
}

function warningDescription(type: string): string {
  return WARNING_DESCRIPTIONS[type]?.() ?? t('A minor issue occurred during this audit. Your results are still valid.')
}

function warningColor(type: string): WarningColor {
  return WARNING_COLORS[type] ?? 'info'
}

function warningIcon(type: string): string {
  return warningColor(type) === 'warning' ? 'i-lucide-alert-triangle' : 'i-lucide-info'
}
</script>
