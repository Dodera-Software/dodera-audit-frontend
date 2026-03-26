<template>
  <ClientOnly>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else>
      <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ t('Audit History') }}</h1>

      <!-- Empty -->
      <div v-if="audits.length === 0" class="mt-8 rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
        <Vue3Lottie animation-link="/animations/animation-bot.json" :height="140" :width="140" :loop="true" :auto-play="true" class="mx-auto" />
        <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No audits yet') }}</h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Run your first audit to see history.') }}</p>
      </div>

      <template v-else>
        <!-- Hero stats -->
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <!-- Best score — hero card -->
          <div class="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-trophy" class="h-4 w-4 text-green-500" />
              <p class="text-xs font-medium text-green-600">{{ t('Best score achieved') }}</p>
            </div>
            <p class="mt-2 text-4xl font-bold text-green-500">{{ bestScore ?? '--' }}</p>
            <p class="mt-1 text-xs text-(--ui-text-dimmed)">{{ t('out of 100') }}</p>
          </div>

          <!-- Improvement card -->
          <div class="rounded-xl border border-(--ui-border) bg-(--ui-bg) p-5">
            <div class="flex items-center gap-2">
              <UIcon
                :name="totalImprovement >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                class="h-4 w-4"
                :class="totalImprovement >= 0 ? 'text-green-500' : 'text-red-500'"
              />
              <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Journey so far') }}</p>
            </div>
            <div class="mt-2 flex items-baseline gap-3">
              <span class="text-sm text-(--ui-text-dimmed)">{{ firstScore ?? '--' }}</span>
              <UIcon name="i-lucide-arrow-right" class="h-3.5 w-3.5 text-(--ui-text-dimmed)" />
              <span class="text-3xl font-bold" :class="latestScore != null ? scoreColorClass(latestScore) : ''">{{ latestScore ?? '--' }}</span>
              <span
                v-if="totalImprovement !== 0"
                class="rounded-full px-2 py-0.5 text-xs font-bold"
                :class="totalImprovement > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'"
              >
                {{ totalImprovement > 0 ? '+' : '' }}{{ totalImprovement }} {{ t('points') }}
              </span>
            </div>
            <p class="mt-1 text-xs text-(--ui-text-dimmed)">
              {{ t('{count} audits completed', { count: completedAudits.length }) }}
            </p>
          </div>
        </div>

        <!-- Chart -->
        <div v-if="chartAudits.length >= 2" class="mt-6 rounded-xl border border-(--ui-border) bg-(--ui-bg) p-6">
          <h3 class="mb-4 text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Score trend') }}</h3>
          <ScoreTrendChart :data="chartAudits" :height="200" clickable @point-click="onChartClick" />
        </div>

        <!-- Rocket motivation -->
        <div class="mt-8 flex flex-col items-center">
          <Vue3Lottie animation-link="/animations/RocketLP.json" :height="100" :width="100" :loop="true" :auto-play="true" />
          <p class="mt-2 text-sm font-medium text-(--ui-text-muted)">{{ t('Keep auditing to track your improvement journey!') }}</p>
        </div>

        <!-- Audit list -->
        <div class="mt-6 space-y-3">
          <div
            v-for="audit in audits"
            :key="audit.id"
            class="group flex cursor-pointer items-center gap-4 rounded-xl border border-(--ui-border) bg-(--ui-bg) p-4 transition-all hover:shadow-md"
            @click="router.push(`/projects/${projectId}/audits/${audit.id}`)"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2"
              :class="audit.overall_score != null ? scoreCircleClass(audit.overall_score) : 'border-(--ui-border) text-(--ui-text-dimmed)'"
            >
              <span class="text-sm font-bold">{{ audit.overall_score ?? '--' }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-(--ui-text-highlighted)">{{ formatDateTime(audit.created_at) }}</span>
                <UBadge v-if="audit.is_latest" color="success" variant="subtle" size="xs">{{ t('Latest') }}</UBadge>
                <UBadge v-if="audit.status === 'failed'" color="error" variant="subtle" size="xs">{{ t('Failed') }}</UBadge>
              </div>
              <div class="mt-0.5 flex items-center gap-3 text-xs text-(--ui-text-dimmed)">
                <span v-if="audit.issues_count != null">{{ audit.issues_count }} {{ audit.issues_count === 1 ? 'issue' : 'issues' }}</span>
                <span v-if="audit.delta != null" class="font-medium" :class="audit.delta > 0 ? 'text-green-500' : audit.delta < 0 ? 'text-red-500' : ''">
                  {{ audit.delta > 0 ? '+' : '' }}{{ audit.delta }} {{ t('vs previous') }}
                </span>
              </div>
            </div>

            <UIcon name="i-lucide-chevron-right" class="h-4 w-4 shrink-0 text-(--ui-text-dimmed) transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { formatDateTime } = useFormatters()

const projectId = route.params.id as string

interface AuditRow {
  id: string
  status: string
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

function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function scoreCircleClass(score: number): string {
  if (score >= 80) return 'border-green-500 text-green-500'
  if (score >= 50) return 'border-yellow-500 text-yellow-500'
  return 'border-red-500 text-red-500'
}

const completedAudits = computed(() => audits.value.filter(a => a.status === 'complete' && a.overall_score != null))
const scores = computed(() => completedAudits.value.map(a => a.overall_score!))
const bestScore = computed(() => scores.value.length > 0 ? Math.max(...scores.value) : null)
const lowestScore = computed(() => scores.value.length > 0 ? Math.min(...scores.value) : null)
const latestScore = computed(() => completedAudits.value[0]?.overall_score ?? null)
const firstScore = computed(() => completedAudits.value.length > 0 ? completedAudits.value[completedAudits.value.length - 1].overall_score : null)
const totalImprovement = computed(() => {
  if (firstScore.value == null || latestScore.value == null) return 0
  return latestScore.value - firstScore.value
})
const successRate = computed(() => {
  if (audits.value.length === 0) return 0
  return Math.round((completedAudits.value.length / audits.value.length) * 100)
})

onMounted(async () => {
  await loadAudits()
})

async function loadAudits() {
  try {
    const data = await $api<{
      data: Array<{
        id: string
        status: string
        trigger_type: string
        overall_score: number | null
        issues_count: number | null
        created_at: string
        completed_at: string | null
      }>
    }>(`/projects/${projectId}/audits?per_page=100`)

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

const chartAudits = computed(() =>
  audits.value
    .filter(a => a.status === 'complete' && a.overall_score != null)
    .reverse(),
)

function onChartClick(index: number) {
  const audit = chartAudits.value[index]
  if (audit?.id) {
    router.push(`/projects/${projectId}/audits/${audit.id}`)
  }
}
</script>
