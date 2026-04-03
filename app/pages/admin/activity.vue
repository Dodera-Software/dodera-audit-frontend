<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="table.loading.value">
        <div class="flex flex-wrap gap-2">
          <USkeleton v-for="i in 6" :key="i" class="h-7 w-24 rounded-md" />
        </div>
        <AdminTableSkeleton :rows="8" />
      </template>

      <template v-else>
        <!-- Action Type Stats -->
        <div v-if="Object.keys(actionCounts).length > 0" class="flex flex-wrap gap-2">
          <UButton
            v-for="(count, action) in actionCounts"
            :key="action"
            variant="soft"
            :color="actionFilter === String(action) ? 'primary' : 'neutral'"
            size="xs"
            @click="toggleFilter(String(action))"
          >
            {{ String(action).replace(/_/g, ' ') }}
            <UBadge :label="String(count)" variant="subtle" size="xs" class="ml-1" />
          </UButton>
          <UButton v-if="actionFilter" variant="ghost" color="neutral" size="xs" icon="i-lucide-x" @click="actionFilter = ''; table.fetch(1)">
            {{ t('Clear') }}
          </UButton>
        </div>

        <BaseDataTable
          :row-data="table.rows.value"
          :column-defs="columnDefs"
          :clickable="false"
          :pagination-meta="table.paginationMeta.value"
          :hide-search="true"
          :show-refresh="true"
          :loading="table.tableLoading.value"
          :default-col-def="{ sortable: false, filter: false, resizable: true }"
          @page-change="table.onPageChange"
          @refresh="table.onRefresh"
        >
          <template #title>
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All Activity') }}</h2>
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
  setNavbar({ title: t('Activity') })
})

const actionFilter = ref('')
const actionCounts = ref<Record<string, number>>({})

const table = useServerDataTable({
  endpoint: '/admin/activity',
  perPage: 50,
  filters: { action: actionFilter },
  immediate: false,
  watchFilters: false,
  errorMessage: t('Failed to load activity.'),
})

const columnDefs = computed<ColDef[]>(() => [
  {
    headerName: t('Action'), field: 'action', width: 180,
    valueFormatter: (p: any) => p.value ? String(p.value).replace(/_/g, ' ') : '',
  },
  { headerName: t('Actor'), field: 'actor.email', flex: 1, minWidth: 180, valueFormatter: (p: any) => p.value || p.data?.actor_email || 'System' },
  { headerName: t('IP'), field: 'ip_address', width: 130 },
  {
    headerName: t('Details'), field: 'context', flex: 1, minWidth: 150,
    valueFormatter: (p: any) => {
      if (!p.value) return ''
      const ctx = { ...p.value }
      delete ctx.target_type
      delete ctx.target_id
      const str = JSON.stringify(ctx)
      return str.length > 80 ? str.slice(0, 80) + '...' : str
    },
  },
  {
    headerName: t('When'), field: 'created_at', width: 160,
    valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleString() : '',
  },
])

function toggleFilter(action: string) {
  actionFilter.value = actionFilter.value === action ? '' : action
  table.fetch(1)
}

onMounted(async () => {
  const [, counts] = await Promise.all([
    table.fetch(),
    $api<Record<string, number>>('/admin/activity/actions').catch(() => ({})),
  ])
  actionCounts.value = counts as Record<string, number>
  table.loading.value = false
})
</script>
