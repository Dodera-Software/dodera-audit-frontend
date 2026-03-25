<template>
  <ClientOnly>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else-if="project">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <img
            :src="`https://www.google.com/s2/favicons?domain=${project.url.replace(/^https?:\/\//, '').split('/')[0]}&sz=32`"
            :alt="project.name"
            class="h-9 w-9 rounded-lg border border-(--ui-border)"
          >
          <div>
            <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ project.name }}</h1>
            <div class="flex items-center gap-2">
              <a :href="project.url" target="_blank" class="text-sm text-(--ui-text-muted) hover:text-(--ui-primary)">
                {{ project.url }}
                <UIcon name="i-lucide-external-link" class="mb-0.5 ml-0.5 inline h-3 w-3" />
              </a>
              <UBadge variant="subtle" color="neutral" size="xs">{{ siteTypeLabel }}</UBadge>
            </div>
          </div>
        </div>
        <UButton
          icon="i-lucide-scan"
          :loading="triggeringAudit"
          :disabled="scanProgress.state.status === 'scanning'"
          @click="triggerAudit"
        >
          {{ t('Audit this page') }}
        </UButton>
      </div>

      <!-- Scan progress -->
      <ScanProgress
        v-if="(scanProgress.state.status === 'scanning' || scanProgress.state.status === 'failed') && !showSuccess"
        :state="scanProgress.state"
        @retry="triggerAudit"
      />

      <!-- Success celebration -->
      <div v-if="showSuccess" class="mt-12 flex flex-col items-center justify-center py-8">
        <Vue3Lottie
          :animation-data="successAnimation"
          :height="160"
          :width="160"
          :loop="false"
          :auto-play="true"
        />
        <h2 class="mt-4 text-xl font-bold text-(--ui-text-highlighted)">{{ t('Your page audit is ready!') }}</h2>
        <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('Taking you to your results...') }}</p>
      </div>

      <template v-else>
        <!-- No audits -->
        <div v-if="project.audits_count === 0" class="mt-8">
          <UCard class="py-16 text-center">
            <UIcon name="i-lucide-scan" class="mx-auto h-12 w-12 text-(--ui-text-muted)" />
            <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Page not audited yet') }}</h3>
            <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Run an audit to see how this page performs for clarity, trust, and conversion.') }}</p>
            <UButton class="mt-6" icon="i-lucide-scan" :loading="triggeringAudit" @click="triggerAudit">
              {{ t('Audit this page') }}
            </UButton>
          </UCard>
        </div>

        <!-- Two-column layout -->
        <div v-else class="mt-6 grid gap-6 lg:grid-cols-3">
          <!-- Left (2/3) -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Score + chart card -->
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Latest score') }}</p>
                  <div class="mt-1 flex items-baseline gap-1">
                    <span class="text-4xl font-bold" :class="scoreColor(project.latest_score ?? 0)">
                      {{ project.latest_score ?? '--' }}
                    </span>
                    <span v-if="project.latest_score != null" class="text-sm text-(--ui-text-muted)">/100</span>
                  </div>
                </div>
                <UButton
                  v-if="project.latest_audit_id"
                  variant="soft"
                  size="sm"
                  trailing-icon="i-lucide-arrow-right"
                  :to="`/projects/${projectId}/audits/${project.latest_audit_id}`"
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
                @click="navigateTo(`/projects/${projectId}/history`)"
              >
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-(--ui-bg-accented)">
                    <UIcon name="i-lucide-history" class="h-4.5 w-4.5 text-(--ui-text-muted)" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-(--ui-text-highlighted) group-hover:text-(--ui-primary)">{{ t('Audit history') }}</p>
                    <p class="text-xs text-(--ui-text-dimmed)">{{ project.audits_count }} {{ project.audits_count === 1 ? 'audit' : 'audits' }}</p>
                  </div>
                  <UIcon name="i-lucide-chevron-right" class="h-4 w-4 text-(--ui-text-dimmed) transition group-hover:translate-x-0.5" />
                </div>
              </UCard>

              <UCard
                class="group cursor-pointer transition-all hover:shadow-md"
                @click="navigateTo(`/projects/${projectId}/board`)"
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

            <!-- Brain: condensed as key insights, not wall of text -->
            <UCard v-if="brain">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-brain" class="h-4 w-4 text-purple-500" />
                <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Project Brain') }}</h3>
                <UBadge v-if="brain.momentum" :color="momentumColor" variant="subtle" size="xs">
                  {{ momentumLabel }}
                </UBadge>
              </div>

              <p v-if="brain.progress_narrative" class="mt-3 whitespace-pre-line text-sm leading-relaxed text-(--ui-text-muted)">
                {{ brain.progress_narrative }}
              </p>

              <!-- Regression alerts as inline badges -->
              <div v-if="brain.regression_alerts?.length" class="mt-3 flex flex-wrap gap-2">
                <UBadge v-for="(alert, i) in brain.regression_alerts" :key="i" color="error" variant="subtle" size="xs">
                  <UIcon name="i-lucide-trending-down" class="mr-1 h-3 w-3" />
                  {{ alert.issue_title }}
                </UBadge>
              </div>

              <!-- First audit state -->
              <p v-if="!brain.progress_narrative" class="mt-3 text-sm text-(--ui-text-dimmed)">
                {{ t('Run more audits to see your progress story. The Brain tracks patterns across audits and builds a narrative of your page\'s improvement journey.') }}
              </p>
            </UCard>
          </div>

          <!-- Right (1/3) -->
          <div class="space-y-4">
            <!-- Details -->
            <UCard>
              <h3 class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Details') }}</h3>
              <dl class="mt-3 space-y-3">
                <div>
                  <dt class="text-xs text-(--ui-text-muted)">{{ t('Conversion goal') }}</dt>
                  <dd class="mt-0.5 text-sm font-medium text-(--ui-text-highlighted)">{{ project.conversion_goal }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-(--ui-text-muted)">{{ t('Total audits') }}</dt>
                  <dd class="mt-0.5 text-sm font-medium text-(--ui-text-highlighted)">{{ project.audits_count }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-(--ui-text-muted)">{{ t('Last audited') }}</dt>
                  <dd class="mt-0.5 text-sm text-(--ui-text-highlighted)">
                    {{ project.latest_audit_date ? formatRelativeDate(project.latest_audit_date) : '—' }}
                  </dd>
                </div>
              </dl>
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
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'
import successAnimation from '~/assets/lottie/success.json'
import { scoreColor } from '~/constants/audit'
import ScanProgress from '~/components/audit/ScanProgress.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { formatRelativeDate } = useFormatters()

const projectId = route.params.id as string
const auditId = ref<string | null>(null)

interface ProjectDetail {
  id: string
  name: string
  url: string
  site_type: string
  conversion_goal: string
  latest_audit_id: string | null
  latest_score: number | null
  latest_audit_date: string | null
  audits_count: number
  scores?: Record<string, number> | null
}

interface BrainData {
  momentum: string | null
  progress_narrative: string | null
  priority_recommendations: Array<{ title: string, reason: string, effort: string }> | null
  regression_alerts: Array<{ issue_title: string, hypothesis: string }> | null
}

const project = ref<ProjectDetail | null>(null)
const brain = ref<BrainData | null>(null)
const loading = ref(true)
const triggeringAudit = ref(false)
const scoreHistory = ref<Array<{ overall_score: number, created_at: string }>>([])

const scanProgress = useScanProgress(auditId)

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
  return labels[project.value?.site_type ?? '']?.() ?? project.value?.site_type ?? ''
})

const latestScores = computed(() => project.value?.scores)

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

const narrativePreview = computed(() => {
  const text = brain.value?.progress_narrative ?? ''
  const sentences = text.split(/(?<=[.!?])\s+/)
  return sentences.slice(0, 2).join(' ')
})

const MOMENTUM_CONFIG: Record<string, { color: any, label: () => string }> = {
  improving: { color: 'success', label: () => t('Improving') },
  plateau: { color: 'warning', label: () => t('Plateau') },
  regressing: { color: 'error', label: () => t('Regressing') },
}

const momentumColor = computed(() => MOMENTUM_CONFIG[brain.value?.momentum ?? '']?.color ?? 'neutral')
const momentumLabel = computed(() => MOMENTUM_CONFIG[brain.value?.momentum ?? '']?.label() ?? brain.value?.momentum)

onMounted(async () => {
  await loadProject()
})

async function loadProject() {
  try {
    const [projectData, scoresData, brainData] = await Promise.all([
      $api<{ data: ProjectDetail }>(`/projects/${projectId}`),
      $api<{ scores: Array<{ overall_score: number, created_at: string }> }>(`/projects/${projectId}/scores`).catch(() => ({ scores: [] })),
      $api<BrainData>(`/projects/${projectId}/brain`).catch(() => null),
    ])
    project.value = projectData.data
    scoreHistory.value = scoresData.scores ?? []
    brain.value = brainData
  }
  catch (e) {
    apiError.parse(e, t('Failed to load project.'))
  }
  finally {
    loading.value = false
  }
}

async function triggerAudit() {
  triggeringAudit.value = true
  apiError.clear()

  try {
    const data = await $api<{ data: { id: string } }>(`/projects/${projectId}/audits`, { method: 'POST' })
    auditId.value = data.data.id
    scanProgress.start()
  }
  catch (e) {
    apiError.parse(e, t('Failed to start audit.'))
  }
  finally {
    triggeringAudit.value = false
  }
}

const showSuccess = ref(false)

watch(() => scanProgress.state.status, async (status) => {
  if (status !== 'complete') return
  showSuccess.value = true
  await loadProject()
  // Show celebration for 2 seconds then navigate
  setTimeout(() => {
    if (auditId.value) {
      navigateTo(`/projects/${projectId}/audits/${auditId.value}`)
    }
  }, 2000)
})
</script>
