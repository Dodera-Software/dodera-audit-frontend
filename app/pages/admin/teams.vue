<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="table.loading.value">
        <AdminKpiSkeleton />
        <AdminTableSkeleton />
      </template>

      <template v-else>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard :label="t('Total Teams')" :value="stats.total_teams ?? 0" icon="i-lucide-users-round" color="primary" />
          <AdminKpiCard :label="t('Total Members')" :value="stats.total_members ?? 0" icon="i-lucide-user" color="primary" />
          <AdminKpiCard :label="t('Avg Team Size')" :value="stats.avg_team_size ?? 0" icon="i-lucide-bar-chart" color="primary" />
          <AdminKpiCard :label="t('Invite Accept Rate')" :value="`${stats.invitation_accept_rate ?? 0}%`" icon="i-lucide-mail-check" color="primary" :subtitle="`${stats.pending_invitations ?? 0} pending`" />
        </div>

        <BaseDataTable
          :row-data="table.rows.value"
          :column-defs="columnDefs"
          :clickable="false"
          :pagination-meta="table.paginationMeta.value"
          :hide-search="false"
          :search-placeholder="t('Search teams...')"
          :show-refresh="true"
          :loading="table.tableLoading.value"
          :default-col-def="{ sortable: true, filter: false, resizable: true }"
          @page-change="table.onPageChange"
          @search="table.onSearch"
          @refresh="table.onRefresh"
        >
          <template #title>
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All Teams') }}</h2>
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
  setNavbar({ title: t('Teams') })
})

const stats = ref<any>({})

const table = useServerDataTable({
  endpoint: '/admin/teams',
  perPage: 25,
  immediate: false,
  errorMessage: t('Failed to load teams.'),
})

const columnDefs = computed<ColDef[]>(() => [
  { headerName: t('Team Name'), field: 'name', flex: 1, minWidth: 150 },
  { headerName: t('Owner'), field: 'owner.email', flex: 1.5, minWidth: 200 },
  { headerName: t('Owner Plan'), field: 'owner.plan', width: 100, cellClass: (p: any) => p.value === 'max' ? 'text-purple-600 font-semibold' : p.value === 'pro' ? 'text-blue-600 font-semibold' : '' },
  { headerName: t('Members'), field: 'members_count', width: 100 },
  { headerName: t('Created'), field: 'created_at', width: 130, valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : '' },
])

onMounted(async () => {
  try {
    const [s] = await Promise.all([
      $api<any>('/admin/teams/stats'),
      table.fetch(),
    ])
    stats.value = s
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load teams.')).message, color: 'error' })
  }
  finally {
    table.loading.value = false
  }
})
</script>
