<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="table.loading.value">
        <AdminKpiSkeleton />
        <AdminChartSkeleton />
        <AdminTableSkeleton />
      </template>

      <template v-else>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard :label="t('Avg Scan')" :value="formatMs(perf.avg_scan_ms)" icon="i-lucide-timer" color="primary" :subtitle="`P95: ${formatMs(perf.p95_scan_ms)}`" />
          <AdminKpiCard :label="t('Avg Analysis')" :value="formatMs(perf.avg_analysis_ms)" icon="i-lucide-brain" color="primary" :subtitle="`P95: ${formatMs(perf.p95_analysis_ms)}`" />
          <AdminKpiCard :label="t('Avg Score')" :value="perf.avg_score ?? 0" icon="i-lucide-gauge" color="primary" />
          <AdminKpiCard :label="t('AI Cost (month)')" :value="formatCurrency(perf.total_cost_this_month_cents)" icon="i-lucide-coins" color="primary" :subtitle="`${formatTokens(perf.total_tokens_this_month)} tokens`" />
        </div>

        <UCard>
          <template #header>
            <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Audit Status Distribution') }}</h3>
          </template>
          <AdminDonutChart
            :labels="Object.keys(statusDist).map(s => s.replace(/_/g, ' '))"
            :values="Object.values(statusDist).map(Number)"
            :colors="['#a1a1aa', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']"
            :height="220"
            :empty-label="t('No audits yet.')"
          />
        </UCard>

        <BaseDataTable
          :row-data="table.rows.value"
          :column-defs="columnDefs"
          :clickable="false"
          :pagination-meta="table.paginationMeta.value"
          :hide-search="true"
          :show-refresh="true"
          :loading="table.tableLoading.value"
          :default-col-def="{ sortable: true, filter: false, resizable: true }"
          @page-change="table.onPageChange"
          @refresh="table.onRefresh"
        >
          <template #title>
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All Audits') }}</h2>
          </template>
          <template #actions>
            <USelect v-model="statusFilter" :items="statusOptions" size="sm" class="w-32" />
          </template>
        </BaseDataTable>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community'

definePageMeta({ middleware: ['auth', 'admin'] })

const { t } = useI18n()
const { $api } = useApi()
const { setNavbar } = usePageNavbar()

onMounted(() => {
  setNavbar({ title: t('Audits') })
})

const perf = ref<any>({})
const statusDist = ref<Record<string, number>>({})
const statusFilter = ref('all')

const table = useServerDataTable({
  endpoint: '/admin/audits',
  perPage: 25,
  filters: { status: statusFilter },
  immediate: false,
  errorMessage: t('Failed to load audits.'),
})

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Scanning', value: 'scanning' },
  { label: 'Analyzing', value: 'analyzing' },
  { label: 'Complete', value: 'complete' },
  { label: 'Failed', value: 'failed' },
]

const columnDefs = computed<ColDef[]>(() => [
  {
    headerName: t('Status'), field: 'status', width: 110,
    cellClass: (p: any) => {
      const map: Record<string, string> = { complete: 'text-emerald-600', failed: 'text-red-500', scanning: 'text-blue-500', analyzing: 'text-purple-500' }
      return map[p.value] || ''
    },
  },
  { headerName: t('Page'), field: 'page.url', flex: 1.5, minWidth: 200, valueFormatter: (p: any) => { try { return p.value ? new URL(p.value).hostname : '' } catch { return p.value || '' } } },
  { headerName: t('User'), field: 'page.user.email', flex: 1, minWidth: 150 },
  { headerName: t('Score'), field: 'overall_score', width: 80, valueFormatter: (p: any) => p.value ?? '-' },
  { headerName: t('Tokens'), field: 'tokens_used', width: 100, valueFormatter: (p: any) => p.value ? formatTokens(p.value) : '-' },
  { headerName: t('Cost'), field: 'estimated_cost_cents', width: 80, valueFormatter: (p: any) => p.value ? formatCurrency(p.value) : '-' },
  { headerName: t('Scan'), field: 'scan_duration_ms', width: 80, valueFormatter: (p: any) => p.value ? formatMs(p.value) : '-' },
  { headerName: t('Analysis'), field: 'analysis_duration_ms', width: 80, valueFormatter: (p: any) => p.value ? formatMs(p.value) : '-' },
  { headerName: t('Created'), field: 'created_at', width: 140, valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleString() : '' },
])

function formatMs(ms: number): string {
  if (!ms) return '0s'
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function formatCurrency(cents: number): string {
  return `€${((cents || 0) / 100).toFixed(2)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n || 0)
}

onMounted(async () => {
  const [stats] = await Promise.all([
    $api<any>('/admin/audits/stats').catch(() => ({ performance: {}, status_distribution: {} })),
    table.fetch(),
  ])
  perf.value = stats.performance
  statusDist.value = stats.status_distribution
  table.loading.value = false
})
</script>
