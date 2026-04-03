<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <!-- Skeleton -->
      <template v-if="loading">
        <AdminKpiSkeleton />
        <AdminKpiSkeleton />
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminChartSkeleton />
          <AdminChartSkeleton class="lg:col-span-2" />
        </div>
      </template>

      <template v-else>
        <!-- KPI Row 1 -->
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard
            :label="t('Total Users')"
            :value="kpis.total_users ?? 0"
            icon="i-lucide-users"
            color="primary"
            :subtitle="t('+{n} this month', { n: kpis.users_this_month ?? 0 })"
            :trend="calcTrend(kpis.users_this_month, kpis.users_last_month)"
          />
          <AdminKpiCard
            :label="t('Total Audits')"
            :value="kpis.total_audits ?? 0"
            icon="i-lucide-scan-search"
            color="primary"
            :subtitle="t('+{n} this month', { n: kpis.audits_this_month ?? 0 })"
            :trend="calcTrend(kpis.audits_this_month, kpis.audits_last_month)"
          />
          <AdminKpiCard
            :label="t('Active Now')"
            :value="kpis.active_audits ?? 0"
            icon="i-lucide-activity"
            color="primary"
            :subtitle="t('Scanning or analyzing')"
          />
          <AdminKpiCard
            :label="t('Failure Rate')"
            :value="`${kpis.failure_rate ?? 0}%`"
            icon="i-lucide-alert-triangle"
            :color="(kpis.failure_rate ?? 0) > 10 ? 'red' : 'primary'"
            :subtitle="t('This month')"
          />
        </div>

        <!-- KPI Row 2 -->
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard :label="t('Total Pages')" :value="kpis.total_pages ?? 0" icon="i-lucide-globe" color="primary" />
          <AdminKpiCard :label="t('Total Issues')" :value="kpis.total_issues ?? 0" icon="i-lucide-bug" color="primary" />
          <AdminKpiCard :label="t('Avg Scan')" :value="formatDuration(kpis.avg_scan_duration_ms)" icon="i-lucide-timer" color="primary" :subtitle="t('This month')" />
          <AdminKpiCard :label="t('AI Cost')" :value="formatCurrency(kpis.cost_this_month_cents)" icon="i-lucide-coins" color="primary" :subtitle="t('{n} tokens', { n: formatNumber(kpis.tokens_this_month) })" />
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Plan Distribution') }}</h3>
            </template>
            <AdminDonutChart
              :labels="['Free', 'Pro', 'Max']"
              :values="[planDistribution.free || 0, planDistribution.pro || 0, planDistribution.max || 0]"
              :colors="['#a1a1aa', '#3b82f6', '#8b5cf6']"
              :height="240"
              :empty-label="t('No users yet.')"
            />
          </UCard>

          <UCard class="lg:col-span-2">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Daily Activity') }}</h3>
                <USelect v-model="chartDays" :items="dayOptions" size="xs" class="w-20" />
              </div>
            </template>
            <div v-if="chartsLoading" class="flex items-center justify-center py-12">
              <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-(--ui-text-muted)" />
            </div>
            <AdminAreaChart v-else :series="activitySeries" :categories="activityCategories" :height="240" />
          </UCard>
        </div>

        <!-- Audit Outcomes -->
        <UCard>
          <template #header>
            <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Audit Outcomes') }}</h3>
          </template>
          <div v-if="chartsLoading" class="flex items-center justify-center py-12">
            <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-(--ui-text-muted)" />
          </div>
          <AdminDonutChart
            v-else
            :labels="['Completed', 'Failed']"
            :values="[outcomeTotals.completed, outcomeTotals.failed]"
            :colors="['#10b981', '#ef4444']"
            :height="220"
            :empty-label="t('No audits completed yet.')"
          />
        </UCard>

        <!-- Activity Feed -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Recent Activity') }}</h3>
              <UButton icon="i-lucide-refresh-cw" variant="ghost" color="neutral" size="xs" square @click="fetchFeed" />
            </div>
          </template>
          <div v-if="feed.length === 0" class="py-6 text-center text-sm text-(--ui-text-muted)">
            {{ t('No activity yet.') }}
          </div>
          <div v-else class="divide-y divide-(--ui-border)">
            <div v-for="item in feed" :key="item.id" class="flex items-start gap-3 py-2.5">
              <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--ui-bg-elevated)">
                <UIcon :name="actionIcon(item.action)" class="h-3.5 w-3.5 text-(--ui-text-muted)" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-(--ui-text-highlighted)">
                  <span class="font-medium">{{ item.actor?.name || item.actor_email || 'System' }}</span>
                  <span class="text-(--ui-text-muted)"> {{ item.action.replace(/_/g, ' ') }}</span>
                </p>
                <p class="text-xs text-(--ui-text-dimmed)">{{ timeAgo(item.created_at) }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

onMounted(() => {
  setNavbar({ title: t('Overview') })
})

const loading = ref(true)
const chartsLoading = ref(false)
const kpis = ref<any>({})
const planDistribution = ref<Record<string, number>>({})
const charts = ref<any>({ signups_per_day: [], audits_per_day: [] })
const feed = ref<any[]>([])

const chartDays = ref('30')
const dayOptions = [
  { label: '7d', value: '7' },
  { label: '14d', value: '14' },
  { label: '30d', value: '30' },
  { label: '90d', value: '90' },
]

const activitySeries = computed(() => [
  { name: 'Signups', data: (charts.value.signups_per_day || []).map((d: any) => d.count) },
  { name: 'Audits', data: (charts.value.audits_per_day || []).map((d: any) => d.count) },
])

const activityCategories = computed(() => {
  const days = charts.value.signups_per_day || charts.value.audits_per_day || []
  return days.map((d: any) => {
    const date = new Date(d.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
})

const outcomeTotals = computed(() => {
  const outcomes = charts.value.audit_outcomes_per_day || []
  return {
    completed: outcomes.reduce((sum: number, d: any) => sum + (d.completed || 0), 0),
    failed: outcomes.reduce((sum: number, d: any) => sum + (d.failed || 0), 0),
  }
})

async function fetchOverview() {
  loading.value = true
  try {
    const data = await $api<any>('/admin/overview')
    kpis.value = data.kpis
    planDistribution.value = data.plan_distribution
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load overview.')).message, color: 'error' })
  }
  finally {
    loading.value = false
  }
}

async function fetchCharts() {
  chartsLoading.value = true
  try {
    charts.value = await $api<any>(`/admin/overview/charts?days=${chartDays.value}`)
  }
  catch { /* silent */ }
  finally {
    chartsLoading.value = false
  }
}

async function fetchFeed() {
  try {
    const data = await $api<any>('/admin/overview/feed')
    feed.value = data.activity
  }
  catch { /* silent */ }
}

function calcTrend(current: number, previous: number): number | null {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

function formatDuration(ms: number): string {
  if (!ms) return '0s'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatCurrency(cents: number): string {
  return `€${((cents || 0) / 100).toFixed(2)}`
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n || 0)
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function actionIcon(action: string): string {
  const map: Record<string, string> = {
    login: 'i-lucide-log-in', logout: 'i-lucide-log-out', register: 'i-lucide-user-plus',
    password_change: 'i-lucide-key', audit_created: 'i-lucide-scan-search', database_reset: 'i-lucide-database',
    user_created: 'i-lucide-user-plus', user_deleted: 'i-lucide-user-minus', plan_changed: 'i-lucide-credit-card',
    issue_status_changed: 'i-lucide-bug',
  }
  return map[action] || 'i-lucide-circle-dot'
}

watch(chartDays, () => fetchCharts())

onMounted(() => {
  fetchOverview()
  fetchCharts()
  fetchFeed()
})
</script>
