<template>
  <ClientOnly>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else>
      <!-- Header -->
      <div class="mb-8 flex items-center gap-4">
        <UButton
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="router.back()"
        />
        <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Audit History') }}</h1>
      </div>

      <!-- Score trend chart -->
      <div v-if="chartData.labels.length >= 2" class="mb-8">
        <UCard>
          <p class="mb-3 text-sm font-medium text-(--ui-text-muted)">{{ t('Score trend') }}</p>
          <div class="h-48">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </UCard>
      </div>

      <!-- Empty state -->
      <div v-if="audits.length === 0" class="py-16 text-center">
        <UIcon name="i-lucide-history" class="mx-auto h-10 w-10 text-(--ui-text-muted)" />
        <p class="mt-3 text-(--ui-text-muted)">{{ t('No audits yet. Run your first audit to see history.') }}</p>
      </div>

      <!-- Audit table -->
      <BaseDataTable
        v-else
        :row-data="audits"
        :column-defs="columnDefs"
        :no-rows-message="t('No audits found.')"
        @row-clicked="onRowClicked"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

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

// Column definitions
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
      if (params.value == null) return '<span style="opacity:0.5">—</span>'
      const color = params.value >= 80 ? '#22c55e' : params.value >= 50 ? '#eab308' : '#ef4444'
      return `<span style="font-weight:700;color:${color}">${params.value}</span>`
    },
    flex: 1,
  },
  {
    headerName: t('Delta'),
    field: 'delta',
    cellRenderer: (params: any) => {
      if (params.value == null) return '<span style="opacity:0.5">—</span>'
      if (params.value === 0) return '<span style="opacity:0.5">0</span>'
      const color = params.value > 0 ? '#22c55e' : '#ef4444'
      const prefix = params.value > 0 ? '+' : ''
      return `<span style="font-weight:500;color:${color}">${prefix}${params.value}</span>`
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
    headerName: t('Trigger'),
    field: 'trigger_type',
    cellRenderer: (params: any) => {
      const labels: Record<string, string> = { manual: t('Manual'), scheduled: t('Scheduled'), webhook: t('Webhook') }
      return labels[params.value] ?? params.value
    },
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
      const isLatest = params.data?.is_latest
      const badge = isLatest
        ? ' <span style="margin-left:6px;padding:1px 6px;border-radius:4px;font-size:11px;background:rgba(59,130,246,0.15);color:#3b82f6">Current</span>'
        : ''
      return `<span style="color:${color};text-transform:capitalize">${params.value}</span>${badge}`
    },
    flex: 1.5,
  },
])

function onRowClicked(data: AuditRow) {
  if (!data?.id) return
  router.push(`/projects/${projectId}/audits/${data.id}`)
}

// Chart
const chartAudits = computed(() =>
  audits.value
    .filter(a => a.status === 'complete' && a.overall_score != null)
    .reverse()
)

const chartData = computed(() => ({
  labels: chartAudits.value.map(a => formatDateTime(a.created_at)),
  datasets: [
    {
      data: chartAudits.value.map(a => a.overall_score),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: '#3b82f6',
      pointHitRadius: 15,
      tension: 0.3,
      fill: true,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      ticks: { maxTicksLimit: 10, font: { size: 11 } },
    },
    y: {
      min: 0,
      max: 100,
      ticks: { stepSize: 20 },
    },
  },
  onClick: (_event: any, elements: any[]) => {
    if (elements.length === 0) return
    const index = elements[0].index
    const audit = chartAudits.value[index]
    if (audit?.id) {
      router.push(`/projects/${projectId}/audits/${audit.id}`)
    }
  },
  onHover: (event: any, elements: any[]) => {
    const canvas = event.native?.target as HTMLCanvasElement | undefined
    if (canvas) {
      canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default'
    }
  },
}
</script>
