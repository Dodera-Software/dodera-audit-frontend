<template>
  <div class="base-data-table">
    <!-- Table header toolbar -->
    <div v-if="showToolbar" class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <slot name="title" />

        <UInput
          v-if="!hideSearch"
          :model-value="searchQuery"
          :placeholder="searchPlaceholder || t('Search...')"
          icon="i-lucide-search"
          size="sm"
          class="w-64"
          @update:model-value="onSearch"
        />

        <UButton
          v-if="showRefresh"
          icon="i-lucide-refresh-cw"
          variant="ghost"
          color="neutral"
          size="sm"
          square
          :title="t('Refresh')"
          @click="$emit('refresh')"
        />
      </div>

      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <AgGridVue
      :theme="gridTheme"
      :row-data="rowData"
      :column-defs="allColumnDefs"
      :column-types="columnTypes"
      :default-col-def="mergedDefaultColDef"
      :dom-layout="domLayout"
      :pagination="clientPagination"
      :pagination-page-size="paginationPageSize"
      :suppress-cell-focus="true"
      :row-class-rules="mergedRowClassRules"
      :row-selection="rowSelection"
      :overlay-no-rows-template="noRowsMessage"
      :get-row-id="getRowId"
      @row-clicked="onRowClicked"
      @grid-ready="(e: GridReadyEvent) => $emit('gridReady', e)"
    />

    <BasePagination
      v-if="paginationMeta"
      :current-page="paginationMeta.currentPage"
      :last-page="paginationMeta.lastPage"
      :total="paginationMeta.total"
      :from="paginationMeta.from"
      :to="paginationMeta.to"
      @update:current-page="(page: number) => $emit('pageChange', page)"
    />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark, colorSchemeLight } from 'ag-grid-community'
import type { ColDef, RowClassRules, RowClickedEvent, GridReadyEvent, GetRowIdParams } from 'ag-grid-community'
import DataTableActions from '~/components/DataTableActions.vue'

ModuleRegistry.registerModules([AllCommunityModule])

const lightTheme = themeQuartz
  .withPart(colorSchemeLight)
  .withParams({
    borderRadius: 8,
    headerFontSize: 13,
    headerFontWeight: 600,
    headerTextColor: 'var(--ui-text-muted)',
    fontSize: 14,
    spacing: 6,
    rowBorder: { color: 'var(--ui-border)', style: 'solid', width: 1 },
  })

const darkTheme = themeQuartz
  .withPart(colorSchemeDark)
  .withParams({
    borderRadius: 8,
    headerFontSize: 13,
    headerFontWeight: 600,
    fontSize: 14,
    spacing: 6,
  })

export interface PaginationMeta {
  currentPage: number
  lastPage: number
  total: number
  from: number
  to: number
}

export interface RowAction {
  label: string
  icon?: string
  color?: 'primary' | 'error' | 'warning' | 'success' | 'neutral'
  onSelect: () => void
}

const props = withDefaults(defineProps<{
  rowData: any[]
  columnDefs: ColDef[]
  defaultColDef?: ColDef
  pagination?: boolean
  paginationPageSize?: number
  paginationMeta?: PaginationMeta
  rowActions?: (row: any) => RowAction[]
  rowIdField?: string
  domLayout?: 'normal' | 'autoHeight' | 'print'
  clickable?: boolean
  rowSelection?: 'single' | 'multiple'
  noRowsMessage?: string
  hideSearch?: boolean
  searchPlaceholder?: string
  showRefresh?: boolean
}>(), {
  pagination: true,
  paginationPageSize: 20,
  rowIdField: 'id',
  domLayout: 'autoHeight',
  clickable: true,
  noRowsMessage: 'No data',
  hideSearch: true,
  showRefresh: false,
})

const emit = defineEmits<{
  rowClicked: [data: any]
  gridReady: [event: GridReadyEvent]
  pageChange: [page: number]
  refresh: []
  search: [query: string]
}>()

const { t } = useI18n()

const searchQuery = ref('')

let searchTimer: ReturnType<typeof setTimeout>
function onSearch(value: string | number) {
  searchQuery.value = String(value)
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}

const showToolbar = computed(() => {
  return !props.hideSearch || props.showRefresh
})

// Column types — registered on AgGridVue so `type: 'actions'` works
const getActions = computed(() => props.rowActions)

const columnTypes: Record<string, ColDef> = {
  actions: {
    cellRenderer: {
      name: 'ActionsRenderer',
      render(cellProps: any) {
        const fn = getActions.value
        if (!fn) return null
        const items = fn(cellProps.params.data)
        return h(DataTableActions, { actions: items })
      },
    } as any,
  },
}

// Append actions column when rowActions is provided
const allColumnDefs = computed<ColDef[]>(() => {
  if (!props.rowActions) return props.columnDefs

  const actionsCol: ColDef = {
    headerName: '',
    field: '__actions',
    type: 'actions',
    editable: false,
    width: 50,
    sortable: false,
    suppressMovable: true,
    pinned: 'right',
  }

  return [...props.columnDefs, actionsCol]
})

const clientPagination = computed(() => props.paginationMeta ? false : props.pagination)

const colorMode = useColorMode()

const gridTheme = computed(() =>
  colorMode.value === 'dark' ? darkTheme : lightTheme,
)

const mergedDefaultColDef = computed<ColDef>(() => ({
  resizable: false,
  filter: false,
  sortable: true,
  ...props.defaultColDef,
}))

const mergedRowClassRules = computed<RowClassRules>(() => {
  if (!props.clickable) return {}
  return { 'cursor-pointer': () => true }
})

function getRowId(params: GetRowIdParams) {
  return params.data?.[props.rowIdField] ?? params.data?.id
}

function onRowClicked(event: RowClickedEvent) {
  if (!props.clickable) return
  emit('rowClicked', event.data)
}
</script>

<style>
.base-data-table {
  .ag-cell {
    display: flex;
    align-items: center;
  }

  .ag-cell-wrapper {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .ag-header-cell-text {
    font-weight: 600;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .ag-center-cols-clipper {
    min-height: 0 !important;
  }

  .ag-cell .ag-input-field-input {
    padding: 0.375rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.06);
    outline: none;
    width: 100%;
  }
}
</style>
