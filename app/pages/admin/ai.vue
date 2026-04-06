<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="loading">
        <AdminKpiSkeleton />
        <AdminChartSkeleton />
        <AdminTableSkeleton />
      </template>

      <template v-else>
        <!-- KPIs -->
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard :label="t('AI Cost (month)')" :value="formatCurrency(kpis.total_cost_cents)" icon="i-lucide-coins" color="primary" :subtitle="formatTokens(kpis.total_tokens) + ' tokens'" />
          <AdminKpiCard :label="t('Avg Cost / Audit')" :value="formatCurrency(kpis.avg_cost_per_audit_cents)" icon="i-lucide-calculator" color="primary" :subtitle="formatTokens(kpis.avg_tokens_per_audit) + ' tokens'" />
          <AdminKpiCard :label="t('Agent Runs')" :value="kpis.total_runs" icon="i-lucide-cpu" color="primary" :subtitle="t('{n} audits', { n: kpis.audits_this_month })" />
          <AdminKpiCard :label="t('Audits (month)')" :value="kpis.audits_this_month" icon="i-lucide-scan-search" color="primary" />
        </div>

        <!-- Cost Over Time -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Daily AI Cost') }}</h3>
              <USelect v-model="costDays" :items="dayOptions" size="xs" class="w-20" />
            </div>
          </template>
          <div v-if="costLoading" class="flex items-center justify-center py-12">
            <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-(--ui-text-muted)" />
          </div>
          <AdminAreaChart
            v-else
            :series="costSeries"
            :categories="costCategories"
            :height="260"
            :colors="['#6366f1', '#10b981']"
          />
        </UCard>

        <!-- Model Distribution + Cost Per Plan -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Cost by Model') }}</h3>
            </template>
            <AdminDonutChart
              :labels="modelDistribution.map((m: any) => m.model)"
              :values="modelDistribution.map((m: any) => m.total_cost_cents)"
              :colors="['#6366f1', '#10b981', '#f59e0b', '#ef4444']"
              :height="220"
              :empty-label="t('No data yet.')"
            />
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Cost by Plan') }}</h3>
            </template>
            <AdminAreaChart
              v-if="costPerPlan.length > 0"
              type="bar"
              :series="[
                { name: t('Cost (cents)'), data: costPerPlan.map((p: any) => p.total_cost_cents) },
                { name: t('Audits'), data: costPerPlan.map((p: any) => p.audits) },
              ]"
              :categories="costPerPlan.map((p: any) => p.plan)"
              :colors="['#6366f1', '#10b981']"
              :height="220"
            />
            <div v-else class="flex flex-col items-center justify-center py-8" style="min-height: 220px">
              <UIcon name="i-lucide-bar-chart" class="mb-2 h-8 w-8 text-(--ui-text-dimmed)" />
              <p class="text-sm text-(--ui-text-muted)">{{ t('No data yet.') }}</p>
            </div>
          </UCard>
        </div>

        <!-- Agent Breakdown Table -->
        <BaseDataTable
          :row-data="agents"
          :column-defs="agentColumnDefs"
          :clickable="false"
          :hide-search="true"
          :default-col-def="{ sortable: true, filter: false, resizable: true }"
        >
          <template #title>
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Per-Agent Breakdown (this month)') }}</h2>
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
const toast = useToast()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

onMounted(() => {
  setNavbar({ title: t('AI Agents') })
})

const loading = ref(true)
const costLoading = ref(false)
const kpis = ref<any>({})
const agents = ref<any[]>([])
const modelDistribution = ref<any[]>([])
const costPerPlan = ref<any[]>([])
const costData = ref<any[]>([])

const costDays = ref('30')
const dayOptions = [
  { label: '7d', value: '7' },
  { label: '14d', value: '14' },
  { label: '30d', value: '30' },
  { label: '90d', value: '90' },
]

const costSeries = computed(() => [
  { name: t('Cost (cents)'), data: costData.value.map((d: any) => d.cost_cents) },
  { name: t('Audits'), data: costData.value.map((d: any) => d.audits) },
])

const costCategories = computed(() =>
  costData.value.map((d: any) => {
    const date = new Date(d.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }),
)

const agentColumnDefs = computed<ColDef[]>(() => [
  { headerName: t('Agent'), field: 'agent_name', flex: 1, minWidth: 150, valueFormatter: (p: any) => p.value ? p.value.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '' },
  { headerName: t('Model'), field: 'model', width: 130 },
  { headerName: t('Runs'), field: 'total_runs', width: 80 },
  { headerName: t('Success'), field: 'success_rate', width: 90, valueFormatter: (p: any) => p.value != null ? `${p.value}%` : '-', cellClass: (p: any) => p.value < 95 ? 'text-red-500' : 'text-emerald-600' },
  { headerName: t('Avg Tokens'), field: 'avg_tokens', width: 110, valueFormatter: (p: any) => formatTokens(p.value) },
  { headerName: t('Avg In/Out'), width: 120, valueFormatter: (p: any) => `${formatTokens(p.data?.avg_tokens_input)} / ${formatTokens(p.data?.avg_tokens_output)}` },
  { headerName: t('Total Tokens'), field: 'total_tokens', width: 120, valueFormatter: (p: any) => formatTokens(p.value) },
  { headerName: t('Avg Cost'), field: 'avg_cost_cents', width: 100, valueFormatter: (p: any) => formatCurrency(p.value) },
  { headerName: t('Total Cost'), field: 'total_cost_cents', width: 110, valueFormatter: (p: any) => formatCurrency(p.value), sort: 'desc' },
  { headerName: t('Avg Duration'), field: 'avg_duration_ms', width: 110, valueFormatter: (p: any) => formatMs(p.value) },
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

async function fetchCostOverTime() {
  costLoading.value = true
  try {
    const data = await $api<any>(`/admin/ai/cost-over-time?days=${costDays.value}`)
    costData.value = data.cost_over_time
  }
  catch { /* silent */ }
  finally {
    costLoading.value = false
  }
}

watch(costDays, () => fetchCostOverTime())

onMounted(async () => {
  try {
    const [stats] = await Promise.all([
      $api<any>('/admin/ai/stats'),
      fetchCostOverTime(),
    ])
    kpis.value = stats.kpis
    agents.value = stats.agents
    modelDistribution.value = stats.model_distribution
    costPerPlan.value = stats.cost_per_plan
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load AI stats.')).message, color: 'error' })
  }
  finally {
    loading.value = false
  }
})
</script>
