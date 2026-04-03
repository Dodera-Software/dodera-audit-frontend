<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="table.loading.value">
        <AdminKpiSkeleton />
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminChartSkeleton v-for="i in 3" :key="i" />
        </div>
        <AdminTableSkeleton />
      </template>

      <template v-else>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard :label="t('Total Issues')" :value="resolution.total ?? 0" icon="i-lucide-bug" color="primary" />
          <AdminKpiCard :label="t('Open')" :value="resolution.open ?? 0" icon="i-lucide-circle-alert" color="red" />
          <AdminKpiCard :label="t('Fixed')" :value="resolution.fixed ?? 0" icon="i-lucide-check-circle" color="emerald" />
          <AdminKpiCard :label="t('Fix Rate')" :value="`${resolution.fix_rate ?? 0}%`" icon="i-lucide-trending-up" color="primary" />
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('By Category') }}</h3>
            </template>
            <AdminDonutChart
              :labels="Object.keys(categoryDist).map(k => k.replace(/_/g, ' '))"
              :values="Object.values(categoryDist).map(Number)"
              :height="220"
              :empty-label="t('No issues detected yet.')"
            />
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('By Severity') }}</h3>
            </template>
            <AdminDonutChart
              :labels="Object.keys(severityDist)"
              :values="Object.values(severityDist).map(Number)"
              :colors="['#ef4444', '#f97316', '#f59e0b', '#3b82f6']"
              :height="220"
              :empty-label="t('No issues detected yet.')"
            />
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('By Status') }}</h3>
            </template>
            <div v-if="Object.keys(statusDist).length === 0" class="flex flex-col items-center justify-center py-8">
              <UIcon name="i-lucide-pie-chart" class="mb-2 h-8 w-8 text-(--ui-text-dimmed)" />
              <p class="text-sm text-(--ui-text-muted)">{{ t('No issues detected yet.') }}</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="(count, status) in statusDist" :key="status" class="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-(--ui-bg-elevated)">
                <span class="text-sm capitalize text-(--ui-text-highlighted)">{{ String(status).replace(/_/g, ' ') }}</span>
                <UBadge :label="String(count)" variant="subtle" size="sm" />
              </div>
            </div>
          </UCard>
        </div>

        <BaseDataTable
          :row-data="table.rows.value"
          :column-defs="columnDefs"
          :clickable="false"
          :pagination-meta="table.paginationMeta.value"
          :hide-search="false"
          :search-placeholder="t('Search issues...')"
          :show-refresh="true"
          :loading="table.tableLoading.value"
          :default-col-def="{ sortable: true, filter: false, resizable: true }"
          @page-change="table.onPageChange"
          @search="table.onSearch"
          @refresh="table.onRefresh"
        >
          <template #title>
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All Issues') }}</h2>
          </template>
          <template #actions>
            <USelect v-model="severityFilter" :items="severityOptions" size="sm" class="w-28" />
            <USelect v-model="statusFilter" :items="statusOptions" size="sm" class="w-28" />
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
  setNavbar({ title: t('Issues') })
})

const categoryDist = ref<Record<string, number>>({})
const severityDist = ref<Record<string, number>>({})
const statusDist = ref<Record<string, number>>({})
const resolution = ref<any>({})
const severityFilter = ref('all')
const statusFilter = ref('all')

const table = useServerDataTable({
  endpoint: '/admin/issues',
  perPage: 25,
  filters: { severity: severityFilter, status: statusFilter },
  immediate: false,
  errorMessage: t('Failed to load issues.'),
})

const severityOptions = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'To Fix', value: 'to_fix' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Fixed', value: 'fixed' },
  { label: 'Verified', value: 'verified' },
  { label: "Won't Fix", value: 'wont_fix' },
]

const columnDefs = computed<ColDef[]>(() => [
  { headerName: t('Title'), field: 'title', flex: 2, minWidth: 200 },
  {
    headerName: t('Severity'), field: 'severity', width: 100,
    cellClass: (p: any) => {
      const map: Record<string, string> = { critical: 'text-red-600 font-semibold', high: 'text-orange-500', medium: 'text-amber-500', low: 'text-blue-500' }
      return map[p.value] || ''
    },
  },
  { headerName: t('Category'), field: 'category', width: 130, valueFormatter: (p: any) => p.value ? String(p.value).replace(/_/g, ' ') : '' },
  { headerName: t('Status'), field: 'status', width: 110, valueFormatter: (p: any) => p.value ? String(p.value).replace(/_/g, ' ') : '' },
  { headerName: t('Impact'), field: 'impact_score', width: 80 },
  { headerName: t('Page'), field: 'page.url', flex: 1, minWidth: 150, valueFormatter: (p: any) => { try { return p.value ? new URL(p.value).hostname : '' } catch { return p.value || '' } } },
  { headerName: t('User'), field: 'user.email', flex: 1, minWidth: 150 },
  { headerName: t('Created'), field: 'created_at', width: 130, valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : '' },
])

onMounted(async () => {
  try {
    const [statsData] = await Promise.all([
      $api<any>('/admin/issues/stats'),
      table.fetch(),
    ])
    categoryDist.value = statsData.category_distribution
    severityDist.value = statsData.severity_distribution
    statusDist.value = statsData.status_distribution
    resolution.value = statsData.resolution
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load issue stats.')).message, color: 'error' })
  }
  finally {
    table.loading.value = false
  }
})
</script>
