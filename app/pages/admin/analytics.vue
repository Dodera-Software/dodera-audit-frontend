<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="table.loading.value">
        <AdminChartSkeleton />
        <AdminKpiSkeleton :count="5" :cols="3" />
        <AdminChartSkeleton />
        <AdminTableSkeleton />
      </template>

      <template v-else>
        <!-- Conversion Funnel -->
        <UCard>
          <template #header>
            <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Conversion Funnel') }}</h3>
          </template>
          <div v-if="funnelSteps.every(s => s.count === 0)" class="py-6 text-center text-sm text-(--ui-text-muted)">
            {{ t('No user activity yet.') }}
          </div>
          <div v-else class="space-y-3">
            <AdminFunnelStep
              v-for="(step, i) in funnelSteps"
              :key="step.key"
              :label="step.label"
              :count="step.count"
              :total="funnelSteps[0]?.count || 1"
              :previous="i > 0 ? funnelSteps[i - 1]?.count : undefined"
              :color="step.color"
            />
          </div>
        </UCard>

        <!-- User Engagement -->
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <AdminKpiCard :label="t('Total Users')" :value="engagement.total ?? 0" icon="i-lucide-users" color="primary" />
          <AdminKpiCard :label="t('Verified')" :value="`${engagement.verification_rate ?? 0}%`" icon="i-lucide-mail-check" color="primary" :subtitle="`${engagement.verified ?? 0} users`" />
          <AdminKpiCard :label="t('Active (30d)')" :value="engagement.active_last_30d ?? 0" icon="i-lucide-activity" color="primary" />
          <AdminKpiCard :label="t('With API Key')" :value="engagement.with_api_key ?? 0" icon="i-lucide-key" color="primary" />
          <AdminKpiCard :label="t('In Teams')" :value="engagement.with_team ?? 0" icon="i-lucide-users-round" color="primary" />
        </div>

        <!-- Signup Trend -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Daily Signups') }}</h3>
              <USelect v-model="signupDays" :items="dayOptions" size="xs" class="w-20" />
            </div>
          </template>
          <AdminAreaChart :series="signupSeries" :categories="signupCategories" :colors="['#6366f1']" :height="200" />
        </UCard>

        <!-- Users Table -->
        <BaseDataTable
          :row-data="table.rows.value"
          :column-defs="userColumnDefs"
          :clickable="false"
          :pagination-meta="table.paginationMeta.value"
          :hide-search="false"
          :search-placeholder="t('Search users...')"
          :show-refresh="true"
          :loading="table.tableLoading.value"
          :default-col-def="{ sortable: true, filter: false, resizable: true }"
          @page-change="table.onPageChange"
          @search="table.onSearch"
          @refresh="table.onRefresh"
        >
          <template #title>
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All Users') }}</h2>
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
  setNavbar({ title: t('Analytics') })
})

const funnel = ref<any>({})
const engagement = ref<any>({})
const signupData = ref<any[]>([])
const signupDays = ref('30')

const table = useServerDataTable({
  endpoint: '/admin/analytics/users',
  perPage: 25,
  immediate: false,
  errorMessage: t('Failed to load users.'),
})

const dayOptions = [
  { label: '7d', value: '7' },
  { label: '14d', value: '14' },
  { label: '30d', value: '30' },
  { label: '90d', value: '90' },
]

const funnelSteps = computed(() => [
  { key: 'signed_up', label: t('Signed Up'), count: funnel.value.signed_up || 0, color: 'bg-blue-500' },
  { key: 'email_verified', label: t('Email Verified'), count: funnel.value.email_verified || 0, color: 'bg-emerald-500' },
  { key: 'created_page', label: t('Created Page'), count: funnel.value.created_page || 0, color: 'bg-amber-500' },
  { key: 'ran_first_audit', label: t('First Audit'), count: funnel.value.ran_first_audit || 0, color: 'bg-purple-500' },
  { key: 'ran_second_audit', label: t('Second Audit'), count: funnel.value.ran_second_audit || 0, color: 'bg-pink-500' },
  { key: 'upgraded', label: t('Upgraded to Paid'), count: funnel.value.upgraded || 0, color: 'bg-primary' },
])

const signupSeries = computed(() => [
  { name: 'Signups', data: signupData.value.map((d: any) => d.count) },
])

const signupCategories = computed(() =>
  signupData.value.map((d: any) => {
    const date = new Date(d.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }),
)

const userColumnDefs = computed<ColDef[]>(() => [
  { headerName: t('Name'), field: 'name', flex: 1, minWidth: 150 },
  { headerName: t('Email'), field: 'email', flex: 1.5, minWidth: 200 },
  {
    headerName: t('Plan'), field: 'plan', width: 80,
    cellClass: (p: any) => p.value === 'max' ? 'text-purple-600 font-semibold' : p.value === 'pro' ? 'text-blue-600 font-semibold' : '',
  },
  { headerName: t('Pages'), field: 'pages_count', width: 80 },
  { headerName: t('Audits'), field: 'audits_count', width: 80 },
  {
    headerName: t('Verified'), field: 'verified', width: 90,
    valueFormatter: (p: any) => p.value ? 'Yes' : 'No',
    cellClass: (p: any) => p.value ? 'text-emerald-600' : 'text-red-500',
  },
  { headerName: t('Joined'), field: 'created_at', width: 130, valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : '' },
])

async function fetchSignups() {
  try {
    signupData.value = await $api<any[]>(`/admin/analytics/signups?days=${signupDays.value}`)
  }
  catch { /* silent */ }
}

watch(signupDays, () => fetchSignups())

onMounted(async () => {
  try {
    const [funnelRes, engagementRes] = await Promise.all([
      $api<any>('/admin/analytics/funnel').catch(() => null),
      $api<any>('/admin/analytics/engagement').catch(() => null),
      fetchSignups(),
      table.fetch(),
    ])
    if (funnelRes) funnel.value = funnelRes
    if (engagementRes) engagement.value = engagementRes
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load analytics.')).message, color: 'error' })
  }
  finally {
    table.loading.value = false
  }
})
</script>
