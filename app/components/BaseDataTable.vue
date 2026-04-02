<template>
  <AgGridVue
    :theme="gridTheme"
    :row-data="rowData"
    :column-defs="columnDefs"
    :default-col-def="mergedDefaultColDef"
    :dom-layout="domLayout"
    :pagination="pagination"
    :pagination-page-size="paginationPageSize"
    :suppress-cell-focus="true"
    :row-class-rules="mergedRowClassRules"
    :row-selection="rowSelection"
    :overlay-no-rows-template="noRowsMessage"
    @row-clicked="onRowClicked"
    @grid-ready="$emit('gridReady', $event)"
  />
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark, colorSchemeLight } from 'ag-grid-community'
import type { ColDef, RowClassRules, RowClickedEvent, GridReadyEvent } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

const lightTheme = themeQuartz.withPart(colorSchemeLight)
const darkTheme = themeQuartz.withPart(colorSchemeDark)

const props = withDefaults(defineProps<{
  rowData: Record<string, unknown>[]
  columnDefs: ColDef[]
  defaultColDef?: ColDef
  pagination?: boolean
  paginationPageSize?: number
  domLayout?: 'normal' | 'autoHeight' | 'print'
  clickable?: boolean
  rowSelection?: 'single' | 'multiple'
  noRowsMessage?: string
}>(), {
  pagination: true,
  paginationPageSize: 20,
  domLayout: 'autoHeight',
  clickable: true,
  noRowsMessage: 'No data',
})

const emit = defineEmits<{
  rowClicked: [data: Record<string, unknown>]
  gridReady: [event: GridReadyEvent]
}>()

const colorMode = useColorMode()

const gridTheme = computed(() =>
  colorMode.value === 'dark' ? darkTheme : lightTheme
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

function onRowClicked(event: RowClickedEvent) {
  if (!props.clickable) return
  emit('rowClicked', event.data)
}
</script>
