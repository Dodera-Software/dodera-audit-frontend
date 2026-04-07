<template>
  <ClientOnly>
    <PageDetailSkeleton v-if="loading" />

    <div v-else-if="page">
      <Teleport to="#navbar-actions">
        <span v-if="isFree" class="text-xs text-(--ui-text-dimmed)">
          {{ auditsThisMonth }}/{{ auditLimit }} {{ t('audits') }}
        </span>
        <UButton
          size="lg"
          :icon="!canAudit ? 'i-lucide-lock' : 'i-lucide-scan'"
          :loading="triggeringAudit"
          :disabled="!!activeScan"
          @click="!canAudit ? showUpgradeModal = true : triggerAudit()"
        >
          {{ !canAudit ? t('Limit reached') : t('Audit this page') }}
        </UButton>
      </Teleport>

      <!-- Scan progress -->
      <div v-if="activeScan && !showSuccess">
        <ScanProgress :scan="activeScan" :url="activeScan.url" @retry="triggerAudit" />
      </div>

      <!-- Success celebration -->
      <div v-if="showSuccess" class="flex flex-col items-center justify-center py-20">
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

      <template v-if="!activeScan && !showSuccess">
        <!-- No audits -->
        <div v-if="page.audits_count === 0">
          <UCard class="py-16 text-center">
            <Vue3Lottie animation-link="/animations/animation-bot.json" :height="140" :width="140" :loop="true" :auto-play="true" class="mx-auto" />
            <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Page not audited yet') }}</h3>
            <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Run an audit to see how this page performs for clarity, trust, and conversion.') }}</p>
            <UButton
              class="mt-6"
              size="xl"
              :icon="!canAudit ? 'i-lucide-lock' : 'i-lucide-scan'"
              :loading="triggeringAudit"
              @click="!canAudit ? showUpgradeModal = true : triggerAudit()"
            >
              {{ !canAudit ? t('Limit reached — upgrade') : t('Audit this page') }}
            </UButton>
          </UCard>
        </div>

        <!-- Two-column layout -->
        <div v-else class="grid gap-6 lg:grid-cols-3">
          <!-- Left (2/3) -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Score + chart card -->
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Latest score') }}</p>
                  <div class="mt-1 flex items-baseline gap-1">
                    <span class="text-4xl font-bold" :class="scoreColor(page.latest_score ?? 0)">
                      {{ page.latest_score ?? '--' }}
                    </span>
                    <span v-if="page.latest_score != null" class="text-sm text-(--ui-text-muted)">/100</span>
                  </div>
                </div>
                <UButton
                  v-if="page.latest_audit_id"
                  variant="soft"
                  size="sm"
                  trailing-icon="i-lucide-arrow-right"
                  :to="`/projects/${projectId}/pages/${pageId}/audits/${page.latest_audit_id}`"
                >
                  {{ t('View latest report') }}
                </UButton>
              </div>

              <div v-if="scoreHistory.length >= 2" class="mt-4 border-t border-(--ui-border) pt-4">
                <ScoreTrendChart :data="scoreHistory" :height="160" />
              </div>
            </UCard>

            <!-- Quick nav -->
            <div class="grid gap-4 sm:grid-cols-2">
              <UCard
                class="group cursor-pointer transition-all hover:shadow-md"
                @click="navigateTo(`/projects/${projectId}/pages/${pageId}/history`)"
              >
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-(--ui-bg-accented)">
                    <UIcon name="i-lucide-history" class="h-4.5 w-4.5 text-(--ui-text-muted)" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-(--ui-text-highlighted) group-hover:text-(--ui-primary)">{{ t('Audit history') }}</p>
                    <p class="text-xs text-(--ui-text-dimmed)">{{ page.audits_count }} {{ page.audits_count === 1 ? 'audit' : 'audits' }}</p>
                  </div>
                  <UIcon name="i-lucide-chevron-right" class="h-4 w-4 text-(--ui-text-dimmed) transition group-hover:translate-x-0.5" />
                </div>
              </UCard>

              <UCard
                class="group cursor-pointer transition-all hover:shadow-md"
                @click="navigateTo(`/projects/${projectId}/pages/${pageId}/board`)"
              >
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-(--ui-bg-accented)">
                    <UIcon name="i-lucide-kanban" class="h-4.5 w-4.5 text-(--ui-text-muted)" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-(--ui-text-highlighted) group-hover:text-(--ui-primary)">{{ t('Issue board') }}</p>
                    <p class="text-xs text-(--ui-text-dimmed)">{{ t('Track and fix issues') }}</p>
                  </div>
                  <UIcon name="i-lucide-chevron-right" class="h-4 w-4 text-(--ui-text-dimmed) transition group-hover:translate-x-0.5" />
                </div>
              </UCard>
            </div>

            <!-- Brain -->
            <PlanGate
              v-if="brain"
              :locked="isFree"
              :title="t('Page Brain narrative')"
              :description="t('AI-generated progress story tracking your page\'s improvement over time.')"
              @upgrade="showUpgradeModal = true"
            >
              <UCard>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-brain" class="h-4 w-4 text-purple-500" />
                  <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Page Brain') }}</h3>
                  <UBadge v-if="brain.momentum" :color="momentumColor" variant="subtle" size="xs">
                    {{ momentumLabel }}
                  </UBadge>
                </div>

                <p v-if="brain.progress_narrative" class="mt-3 whitespace-pre-line text-sm leading-relaxed text-(--ui-text-muted)">
                  {{ brain.progress_narrative }}
                </p>

                <div v-if="brain.regression_alerts?.length" class="mt-3 flex flex-wrap gap-2">
                  <UBadge v-for="(alert, i) in brain.regression_alerts" :key="i" color="error" variant="subtle" size="xs">
                    <UIcon name="i-lucide-trending-down" class="mr-1 h-3 w-3" />
                    {{ alert.issue_title }}
                  </UBadge>
                </div>

                <p v-if="!brain.progress_narrative" class="mt-3 text-sm text-(--ui-text-dimmed)">
                  {{ t('Run more audits to see your progress story. The Brain tracks patterns across audits and builds a narrative of your page\'s improvement journey.') }}
                </p>
              </UCard>
            </PlanGate>
          </div>

          <!-- Right (1/3) -->
          <div class="space-y-4">
            <!-- Details -->
            <UCard>
              <h3 class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Details') }}</h3>
              <dl class="mt-3 space-y-3">
                <div>
                  <dt class="text-xs text-(--ui-text-muted)">{{ t('Conversion goal') }}</dt>
                  <dd class="mt-0.5 text-sm font-medium text-(--ui-text-highlighted)">{{ page.conversion_goal }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-(--ui-text-muted)">{{ t('Total audits') }}</dt>
                  <dd class="mt-0.5 text-sm font-medium text-(--ui-text-highlighted)">{{ page.audits_count }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-(--ui-text-muted)">{{ t('Last audited') }}</dt>
                  <dd class="mt-0.5 text-sm text-(--ui-text-highlighted)">
                    {{ page.latest_audit_date ? formatRelativeDate(page.latest_audit_date) : '—' }}
                  </dd>
                </div>
              </dl>
            </UCard>

            <!-- AI Note -->
            <UCard>
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('AI auditor note') }}</h3>
                <UButton
                  v-if="!editingAiNote"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-pencil"
                  @click="startEditAiNote"
                />
              </div>
              <div v-if="editingAiNote" class="mt-2">
                <UTextarea
                  v-model="aiNoteValue"
                  :rows="2"
                  :maxlength="300"
                  :placeholder="t('e.g. Focus on the pricing section — we recently redesigned it.')"
                  class="w-full"
                />
                <div class="mt-2 flex justify-end gap-2">
                  <UButton variant="ghost" size="xs" @click="editingAiNote = false">{{ t('Cancel') }}</UButton>
                  <UButton size="xs" :loading="savingAiNote" @click="saveAiNote">{{ t('Save') }}</UButton>
                </div>
              </div>
              <p v-else-if="page.ai_note" class="mt-2 text-sm text-(--ui-text-highlighted)">{{ page.ai_note }}</p>
              <p v-else class="mt-2 text-xs text-(--ui-text-dimmed) italic">{{ t('No custom instructions. The AI will use default audit strategy.') }}</p>
            </UCard>

            <!-- Score breakdown -->
            <UCard v-if="latestScores">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Score breakdown') }}</h3>
              <div class="mt-3 space-y-2.5">
                <div v-for="cat in scoreCategories" :key="cat.key">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-(--ui-text-muted)">{{ cat.label }}</span>
                    <span class="text-xs font-bold" :class="scoreColor(cat.value)">{{ cat.value }}</span>
                  </div>
                  <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-(--ui-bg-accented)">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="scoreBarColor(cat.value)"
                      :style="{ width: `${cat.value}%` }"
                    />
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Priority recommendations -->
            <UCard v-if="brain?.priority_recommendations?.length">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Priority recommendations') }}</h3>
              <div class="mt-3 space-y-3">
                <div
                  v-for="(rec, i) in brain.priority_recommendations.slice(0, 3)"
                  :key="i"
                  class="flex items-start gap-2"
                >
                  <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--ui-primary)/10 text-[10px] font-bold text-(--ui-primary)">
                    {{ i + 1 }}
                  </span>
                  <div>
                    <p class="text-xs font-medium text-(--ui-text-highlighted)">{{ rec.title }}</p>
                    <p class="mt-0.5 text-[11px] leading-relaxed text-(--ui-text-dimmed)">{{ rec.reason }}</p>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </div>

    <UpgradeModal
      v-model:open="showUpgradeModal"
      :reason="t('You\'ve used your monthly audit. Upgrade for more.')"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'
import { scoreColor } from '~/constants/audit'
import type { BadgeColor } from '~/types'
import ScanProgress from '~/components/audit/ScanProgress.vue'
import PlanGate from '~/components/billing/PlanGate.vue'
import UpgradeModal from '~/components/billing/UpgradeModal.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { formatRelativeDate } = useFormatters()
const { setNavbar } = usePageNavbar()

const projectId = route.params.id as string
const pageId = route.params.pageId as string
const scanStore = useScanProgressStore()
const { isFree, canAudit, auditsThisMonth, auditLimit, fetchBillingStatus, invalidateBillingStatus } = usePlan()
const showUpgradeModal = ref(false)

interface PageDetail {
  id: string
  name: string | null
  url: string
  site_type: string
  conversion_goal: string
  latest_audit_id: string | null
  latest_score: number | null
  latest_audit_date: string | null
  audits_count: number
  scores?: Record<string, number> | null
  ai_note?: string | null
}

interface BrainData {
  momentum: string | null
  progress_narrative: string | null
  priority_recommendations: Array<{ title: string, reason: string, effort: string }> | null
  regression_alerts: Array<{ issue_title: string, hypothesis: string }> | null
}

const page = ref<PageDetail | null>(null)
const brain = ref<BrainData | null>(null)
const loading = ref(true)
const triggeringAudit = ref(false)
const scoreHistory = ref<Array<{ overall_score: number, created_at: string }>>([])

const activeScan = computed(() => scanStore.scanForProject(pageId))
const showSuccess = ref(false)

// AI note inline editing
const editingAiNote = ref(false)
const aiNoteValue = ref('')
const savingAiNote = ref(false)

function startEditAiNote() {
  aiNoteValue.value = page.value?.ai_note || ''
  editingAiNote.value = true
}

async function saveAiNote() {
  savingAiNote.value = true
  try {
    await $api(`/pages/${pageId}`, { method: 'PATCH', body: { ai_note: aiNoteValue.value || null } })
    if (page.value) {
      page.value.ai_note = aiNoteValue.value || null
    }
    editingAiNote.value = false
  }
  catch (e) {
    apiError.parse(e, t('Failed to save note.'))
  }
  finally {
    savingAiNote.value = false
  }
}

const siteTypeLabel = computed(() => {
  const labels: Record<string, () => string> = {
    saas: () => t('SaaS'),
    ecommerce: () => t('E-commerce'),
    agency: () => t('Agency'),
    lead_gen: () => t('Lead Gen'),
    local: () => t('Local Business'),
    blog: () => t('Blog'),
    webapp: () => t('Web App'),
    other: () => t('Other'),
  }
  return labels[page.value?.site_type ?? '']?.() ?? page.value?.site_type ?? ''
})

const latestScores = computed(() => page.value?.scores)

const scoreCategories = computed(() => {
  const s = latestScores.value
  if (!s) return []
  return [
    { key: 'clarity', label: t('Clarity'), value: s.clarity ?? 0 },
    { key: 'trust', label: t('Trust'), value: s.trust ?? 0 },
    { key: 'conversion', label: t('Conversion'), value: s.conversion ?? 0 },
    { key: 'performance', label: t('Performance'), value: s.performance ?? 0 },
    { key: 'technical', label: t('Technical'), value: s.technical ?? 0 },
  ]
})

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const MOMENTUM_CONFIG: Record<string, { color: BadgeColor, label: () => string }> = {
  improving: { color: 'success', label: () => t('Improving') },
  plateau: { color: 'warning', label: () => t('Plateau') },
  regressing: { color: 'error', label: () => t('Regressing') },
}

const momentumColor = computed(() => MOMENTUM_CONFIG[brain.value?.momentum ?? '']?.color ?? 'neutral' as BadgeColor)
const momentumLabel = computed(() => MOMENTUM_CONFIG[brain.value?.momentum ?? '']?.label() ?? brain.value?.momentum)

onMounted(async () => {
  await Promise.all([loadPage(), fetchBillingStatus()])

  const auditParam = route.query.audit as string | undefined
  if (auditParam && !activeScan.value) {
    scanStore.startScan(auditParam, pageId, page.value?.url ?? '')
  }
})

async function loadPage() {
  try {
    const [pageData, scoresData, brainData] = await Promise.all([
      $api<{ data: PageDetail }>(`/pages/${pageId}`),
      $api<{ scores: Array<{ overall_score: number, created_at: string }> }>(`/pages/${pageId}/scores`).catch(() => ({ scores: [] })),
      $api<BrainData>(`/pages/${pageId}/brain`).catch(() => null),
    ])
    page.value = pageData.data
    scoreHistory.value = scoresData.scores ?? []
    brain.value = brainData
  }
  catch (e) {
    apiError.parse(e, t('Failed to load page.'))
  }
  finally {
    loading.value = false
  }
}

async function triggerAudit() {
  triggeringAudit.value = true
  apiError.clear()

  try {
    const data = await $api<{ data: { id: string } }>(`/pages/${pageId}/audits`, { method: 'POST' })
    scanStore.startScan(data.data.id, pageId, page.value?.url ?? '')
    // Immediately refresh billing status so the counter updates
    invalidateBillingStatus()
    await fetchBillingStatus()
  }
  catch (e) {
    apiError.parse(e, t('Failed to start audit.'))
  }
  finally {
    triggeringAudit.value = false
  }
}

watchEffect(() => {
  setNavbar({
    title: page.value?.name || page.value?.url || t('Page'),
    subtitle: page.value?.url ?? undefined,
    showBack: true,
    backTo: `/projects/${projectId}`,
    hidden: false,
  })
})

watch(() => activeScan.value?.status, async (status) => {
  if (status !== 'complete') return
  const completedAuditId = activeScan.value?.auditId
  showSuccess.value = true
  invalidateBillingStatus()
  await Promise.all([loadPage(), fetchBillingStatus()])
  setTimeout(() => {
    showSuccess.value = false
    if (completedAuditId) {
      navigateTo(`/projects/${projectId}/pages/${pageId}/audits/${completedAuditId}`)
    }
  }, 2000)
})
</script>
