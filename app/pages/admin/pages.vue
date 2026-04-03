<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="table.loading.value">
        <AdminKpiSkeleton />
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AdminChartSkeleton v-for="i in 2" :key="i" />
        </div>
        <AdminTableSkeleton />
      </template>

      <template v-else>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard :label="t('Avg Score')" :value="scores.avg ?? 0" icon="i-lucide-gauge" color="primary" />
          <AdminKpiCard :label="t('Median Score')" :value="scores.median ?? 0" icon="i-lucide-minus" color="primary" />
          <AdminKpiCard :label="t('Min Score')" :value="scores.min ?? 0" icon="i-lucide-arrow-down" color="red" />
          <AdminKpiCard :label="t('Max Score')" :value="scores.max ?? 0" icon="i-lucide-arrow-up" color="emerald" />
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Pages by Site Type') }}</h3>
            </template>
            <AdminDonutChart
              :labels="Object.keys(siteTypeDist).map(k => k.replace(/_/g, ' '))"
              :values="Object.values(siteTypeDist).map(Number)"
              :height="260"
              :empty-label="t('No pages yet.')"
            />
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Average Score by Site Type') }}</h3>
            </template>
            <AdminAreaChart
              v-if="avgScores.length > 0"
              type="bar"
              :series="[{ name: 'Avg Score', data: avgScores.map((s: any) => s.avg_score) }]"
              :categories="avgScores.map((s: any) => s.site_type.replace(/_/g, ' '))"
              :colors="['#6366f1']"
              :height="240"
            />
            <div v-else class="flex flex-col items-center justify-center py-8" style="min-height: 240px">
              <UIcon name="i-lucide-bar-chart" class="mb-2 h-8 w-8 text-(--ui-text-dimmed)" />
              <p class="text-sm text-(--ui-text-muted)">{{ t('No completed audits yet.') }}</p>
            </div>
          </UCard>
        </div>

        <BaseDataTable
          :row-data="table.rows.value"
          :column-defs="columnDefs"
          :clickable="false"
          :pagination-meta="table.paginationMeta.value"
          :hide-search="false"
          :search-placeholder="t('Search by name or URL...')"
          :show-refresh="true"
          :loading="table.tableLoading.value"
          :default-col-def="{ sortable: true, filter: false, resizable: true }"
          @page-change="table.onPageChange"
          @search="table.onSearch"
          @refresh="table.onRefresh"
        >
          <template #title>
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All Pages') }}</h2>
          </template>
          <template #actions>
            <USelect v-model="siteTypeFilter" :items="siteTypeOptions" size="sm" class="w-36" />
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
  setNavbar({ title: t('Pages') })
})

const siteTypeDist = ref<Record<string, number>>({})
const avgScores = ref<any[]>([])
const scores = ref<any>({ avg: 0, median: 0, min: 0, max: 0 })
const siteTypeFilter = ref('all')

const table = useServerDataTable({
  endpoint: '/admin/pages',
  perPage: 25,
  filters: { site_type: siteTypeFilter },
  immediate: false,
  errorMessage: t('Failed to load pages.'),
})

const siteTypeOptions = computed(() => {
  const types = Object.keys(siteTypeDist.value)
  return [
    { label: 'All', value: 'all' },
    ...types.map(t => ({ label: t.replace(/_/g, ' '), value: t })),
  ]
})

const columnDefs = computed<ColDef[]>(() => [
  { headerName: t('Name'), field: 'name', flex: 1, minWidth: 150, valueFormatter: (p: any) => p.value || extractDomain(p.data?.url) },
  { headerName: t('URL'), field: 'url', flex: 1.5, minWidth: 200, valueFormatter: (p: any) => { try { return p.value ? new URL(p.value).hostname + new URL(p.value).pathname : '' } catch { return p.value || '' } } },
  { headerName: t('Site Type'), field: 'site_type', width: 120, valueFormatter: (p: any) => p.value ? String(p.value).replace(/_/g, ' ') : '' },
  { headerName: t('Audits'), field: 'audits_count', width: 80 },
  { headerName: t('Avg Score'), field: 'avg_score', width: 100, valueFormatter: (p: any) => p.value != null ? p.value : '-' },
  { headerName: t('Owner'), field: 'user.email', flex: 1, minWidth: 150 },
  { headerName: t('Created'), field: 'created_at', width: 130, valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : '' },
])

function extractDomain(url: string): string {
  try { return new URL(url).hostname } catch { return url || '' }
}

onMounted(async () => {
  try {
    const [statsData] = await Promise.all([
      $api<any>('/admin/pages/stats'),
      table.fetch(),
    ])
    siteTypeDist.value = statsData.site_type_distribution
    avgScores.value = statsData.avg_score_by_site_type
    scores.value = statsData.score_distribution
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load page stats.')).message, color: 'error' })
  }
  finally {
    table.loading.value = false
  }
})
</script>
