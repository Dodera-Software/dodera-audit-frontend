<template>
  <ClientOnly>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex items-center gap-3">
        <UButton variant="ghost" icon="i-lucide-arrow-left" size="sm" square @click="router.back()" />
        <h1 class="font-display text-xl font-bold text-(--ui-text-highlighted)">{{ t('Audit History') }}</h1>
      </div>

      <!-- Empty -->
      <div v-if="audits.length === 0" class="mt-8 rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
        <UIcon name="i-lucide-history" class="mx-auto h-12 w-12 text-(--ui-text-muted)" />
        <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No audits yet') }}</h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Run your first audit to see history.') }}</p>
      </div>

      <template v-else>
        <!-- Top: chart + summary -->
        <div class="mt-6 grid gap-5 lg:grid-cols-3">
          <UCard v-if="chartAudits.length >= 2" class="lg:col-span-2">
            <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Score trend') }}</p>
            <div class="mt-2">
              <ScoreTrendChart :data="chartAudits" :height="200" clickable @point-click="onChartClick" />
            </div>
          </UCard>

          <UCard>
            <p class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Summary') }}</p>
            <div class="mt-4 space-y-4">
              <div>
                <p class="text-xs text-(--ui-text-muted)">{{ t('Total audits') }}</p>
                <p class="text-2xl font-bold text-(--ui-text-highlighted)">{{ audits.length }}</p>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted)">{{ t('Best score') }}</p>
                <p class="text-2xl font-bold text-green-500">{{ bestScore ?? '--' }}</p>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted)">{{ t('Latest score') }}</p>
                <div class="flex items-baseline gap-2">
                  <p class="text-2xl font-bold" :class="latestScore != null ? scoreColorClass(latestScore) : 'text-(--ui-text-muted)'">
                    {{ latestScore ?? '--' }}
                  </p>
                  <span v-if="audits[0]?.delta" class="text-sm font-medium" :class="audits[0].delta > 0 ? 'text-green-500' : 'text-red-500'">
                    {{ audits[0].delta > 0 ? '+' : '' }}{{ audits[0].delta }}
                  </span>
                </div>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted)">{{ t('Success rate') }}</p>
                <p class="text-2xl font-bold text-(--ui-text-highlighted)">{{ successRate }}%</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Table -->
        <div class="mt-6">
          <p class="mb-3 text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All audits') }}</p>
          <BaseDataTable
            :row-data="audits"
            :column-defs="columnDefs"
            :no-rows-message="t('No audits found.')"
            @row-clicked="onRowClicked"
          />
        </div>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community'

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

const completedAudits = computed(() => audits.value.filter(a => a.status === 'complete' && a.overall_score != null))
const bestScore = computed(() => completedAudits.value.length > 0 ? Math.max(...completedAudits.value.map(a => a.overall_score!)) : null)
const latestScore = computed(() => completedAudits.value[0]?.overall_score ?? null)
const successRate = computed(() => {
  if (audits.value.length === 0) return 0
  return Math.round((completedAudits.value.length / audits.value.length) * 100)
})

const columnDefs = computed<ColDef[]>(() => [
  {
    headerName: t('Date'),
    field: 'created_at',
    valueFormatter: (params: any) => params.value ? formatDateTime(params.value) : '',
    flex: 2,
  },
  {
    headerName: t('Score'),
    field: 'overall_score',
    cellRenderer: (params: any) => {
      if (params.value == null) return '<span style="opacity:0.4">—</span>'
      const color = params.value >= 80 ? '#22c55e' : params.value >= 50 ? '#eab308' : '#ef4444'
      return `<span style="font-weight:700;color:${color}">${params.value}</span>`
    },
    flex: 1,
  },
  {
    headerName: t('Change'),
    field: 'delta',
    cellRenderer: (params: any) => {
      if (params.value == null) return '<span style="opacity:0.4">—</span>'
      if (params.value === 0) return '<span style="opacity:0.4">0</span>'
      const color = params.value > 0 ? '#22c55e' : '#ef4444'
      const prefix = params.value > 0 ? '+' : ''
      return `<span style="font-weight:600;color:${color}">${prefix}${params.value}</span>`
    },
    flex: 1,
  },
  {
    headerName: t('Issues'),
    field: 'issues_count',
    valueFormatter: (params: any) => params.value != null ? params.value : '—',
    flex: 1,
  },
  {
    headerName: t('Status'),
    field: 'status',
    cellRenderer: (params: any) => {
      const colors: Record<string, string> = {
        complete: '#22c55e',
        failed: '#ef4444',
        pending: '#9ca3af',
        scanning: '#3b82f6',
        analyzing: '#3b82f6',
      }
      const color = colors[params.value] ?? '#9ca3af'
      const labels: Record<string, string> = {
        complete: 'Complete',
        failed: 'Failed',
        pending: 'Pending',
        scanning: 'Scanning',
        analyzing: 'Analyzing',
      }
      const label = labels[params.value] ?? params.value
      const isLatest = params.data?.is_latest
      const badge = isLatest
        ? ' <span style="margin-left:6px;padding:1px 6px;border-radius:4px;font-size:10px;background:rgba(16,185,129,0.15);color:#10b981">Latest</span>'
        : ''
      return `<span style="color:${color}">${label}</span>${badge}`
    },
    flex: 1.5,
  },
])

function onRowClicked(data: AuditRow) {
  if (!data?.id) return
  router.push(`/projects/${projectId}/audits/${data.id}`)
}

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
