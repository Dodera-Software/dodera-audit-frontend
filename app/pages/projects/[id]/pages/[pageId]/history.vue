<template>
  <ClientOnly>
    <AuditHistorySkeleton v-if="loading" />

    <UiPageShell v-else>
      <!-- Empty state -->
      <UCard v-if="audits.length === 0" class="py-16 text-center">
        <UiLottie src="/animations/animation-bot.json" :height="160" :width="160" class="mx-auto" />
        <h3 class="mt-4 text-xl font-bold text-(--ui-text-highlighted)">
          {{ t('No audits yet') }}
        </h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">
          {{ t('Run your first audit to start tracking your improvement journey.') }}
        </p>
        <UButton
          class="mt-6"
          size="lg"
          icon="i-lucide-scan"
          :to="`/projects/${projectId}/pages/${pageId}`"
        >
          {{ t('Audit this page') }}
        </UButton>
      </UCard>

      <template v-else>
        <!-- ─── HERO CARD ──────────────────────────────────────────── -->
        <AuditHistoryHero
          :latest-score="latestScore"
          :best-score="bestScore"
          :total-improvement="totalImprovement"
          :completed-audits-count="completedAudits.length"
          :latest-audit-id="latestAuditId"
          :page-url="pageUrl"
          :chart-audits="chartAudits"
          :velocity="velocity"
          :project-id="projectId"
          :page-id="pageId"
          @new-audit="showRescanModal = true"
          @chart-click="onChartClick"
        />

        <!-- ─── AUDIT LIST ──────────────────────────────────────────── -->
        <div>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">
              {{ t('Audit runs') }}
              <span class="ml-1.5 text-xs font-normal text-(--ui-text-dimmed)">({{ audits.length }})</span>
            </h3>
            <USelect
              v-model="sortBy"
              size="xs"
              :items="sortOptions"
              class="w-36"
            />
          </div>

          <div class="space-y-1.5">
            <AuditHistoryCard
              v-for="audit in sortedAudits"
              :key="audit.id"
              :audit="audit"
              :project-id="projectId"
              :page-id="pageId"
              @open="navigateToAudit"
            />
          </div>
        </div>
      </template>
    </UiPageShell>

    <QuickRescanModal
      v-model="showRescanModal"
      :page-id="pageId"
      @started="handleRescanStarted"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { VelocityData } from '~/components/audit/AuditVelocity.vue'
import { AuditStatus } from '~/types'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()
const { formatDateTime, formatRelativeDate } = useFormatters()

const projectId = route.params.id as string
const pageId = route.params.pageId as string

interface AuditRow {
  id: string
  status: AuditStatus
  trigger_type: string
  overall_score: number | null
  issues_count: number | null
  created_at: string
  completed_at: string | null
  is_latest: boolean
  delta: number | null
}

const audits = ref<AuditRow[]>([])
const loading = ref(true)
const pageUrl = ref<string | null>(null)
const showRescanModal = ref(false)

type SortKey = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'
const sortBy = ref<SortKey>('date_desc')

const sortOptions = computed(() => [
  { label: t('Newest first'), value: 'date_desc' as SortKey },
  { label: t('Oldest first'), value: 'date_asc' as SortKey },
  { label: t('Highest score'), value: 'score_desc' as SortKey },
  { label: t('Lowest score'), value: 'score_asc' as SortKey },
])

onMounted(() => {
  setNavbar({
    title: t('Audit History'),
    showBack: true,
    backTo: `/projects/${projectId}/pages/${pageId}`,
  })
})

onMounted(async () => {
  await Promise.all([loadPage(), loadAudits()])
})

async function loadPage() {
  try {
    const data = await $api<{ data: { url: string } }>(`/pages/${pageId}`)
    pageUrl.value = data.data.url
  }
  catch {
    // non-critical — page preview is optional
  }
}

async function loadAudits() {
  try {
    const data = await $api<{
      data: Array<{
        id: string
        status: AuditStatus
        trigger_type: string
        overall_score: number | null
        issues_count: number | null
        created_at: string
        completed_at: string | null
      }>
    }>(`/pages/${pageId}/audits?per_page=100`)

    audits.value = data.data.map((audit, index) => {
      const prev = data.data[index + 1]
      const delta = (audit.overall_score != null && prev?.overall_score != null)
        ? audit.overall_score - prev.overall_score
        : null

      return { ...audit, is_latest: index === 0, delta }
    })
  }
  catch (e) {
    apiError.parse(e, t('Failed to load audit history.'))
  }
  finally {
    loading.value = false
  }
}

const completedAudits = computed(() =>
  audits.value.filter(a => a.status === AuditStatus.Complete && a.overall_score != null),
)
const scores = computed(() => completedAudits.value.map(a => a.overall_score!))
const bestScore = computed(() => scores.value.length > 0 ? Math.max(...scores.value) : null)
const latestScore = computed(() => completedAudits.value[0]?.overall_score ?? null)
const latestAuditId = computed(() => completedAudits.value[0]?.id ?? null)
const firstScore = computed(() => {
  if (!completedAudits.value.length) return null
  return completedAudits.value[completedAudits.value.length - 1]?.overall_score ?? null
})
const totalImprovement = computed(() => {
  if (firstScore.value == null || latestScore.value == null) return 0
  return latestScore.value - firstScore.value
})

const chartAudits = computed(() =>
  audits.value
    .filter(a => a.status === AuditStatus.Complete && a.overall_score != null)
    .map(a => ({ ...a, overall_score: a.overall_score as number }))
    .reverse(),
)

const SCORE_GRADIENTS: Array<{ min: number, className: string }> = [
  { min: 80, className: 'bg-gradient-to-br from-green-500/5 via-transparent to-transparent' },
  { min: 50, className: 'bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent' },
  { min: 0, className: 'bg-gradient-to-br from-red-500/5 via-transparent to-transparent' },
]

const heroGradient = computed(() => {
  if (latestScore.value == null) return ''
  return SCORE_GRADIENTS.find(g => latestScore.value! >= g.min)?.className ?? ''
})

const velocity = computed((): VelocityData | null => {
  const pts = chartAudits.value
  if (pts.length < 3) return null

  const perAudit = totalImprovement.value / Math.max(pts.length - 1, 1)
  const rounded = Math.round(perAudit * 10) / 10

  let trend: 'improving' | 'stable' | 'declining'
  if (rounded > 0.5) trend = 'improving'
  else if (rounded < -0.5) trend = 'declining'
  else trend = 'stable'

  const auditsTo85 =
    trend === 'improving' && latestScore.value != null && latestScore.value < 85 && perAudit > 0
      ? Math.ceil((85 - latestScore.value) / perAudit)
      : null

  return {
    score_per_audit: rounded,
    audits_to_85: auditsTo85,
    trend,
    data_points: pts.length,
  }
})

const sortedAudits = computed(() => {
  const copy = [...audits.value]
  if (sortBy.value === 'date_asc') return copy.reverse()
  if (sortBy.value === 'score_desc') return copy.sort((a, b) => (b.overall_score ?? -1) - (a.overall_score ?? -1))
  if (sortBy.value === 'score_asc') return copy.sort((a, b) => (a.overall_score ?? 101) - (b.overall_score ?? 101))
  return copy // date_desc is default from API
})

function navigateToAudit(auditId: string) {
  router.push(`/projects/${projectId}/pages/${pageId}/audits/${auditId}`)
}

function onChartClick(index: number) {
  const audit = chartAudits.value[index]
  if (audit?.id) {
    navigateToAudit(audit.id)
  }
}

function handleRescanStarted(auditId: string) {
  router.push(`/projects/${projectId}/pages/${pageId}?audit=${auditId}`)
}
</script>
