<template>
  <div class="flex h-full items-center justify-center">
    <UIcon :name="iconName" class="h-4 w-4" :class="colorClass" />
  </div>
</template>

<script setup lang="ts">
/**
 * Reusable ag-grid cell renderer for iconify icons (e.g. "i-lucide-megaphone").
 *
 * ag-grid-vue3 flattens `cellRendererParams` into the `params` object, so custom
 * presentation options (fallback, colorClass) live on `params.*`, not as root
 * props. Configure via the column def:
 *
 *   {
 *     cellRenderer: DataTableIconCell,
 *     cellRendererParams: { fallback: 'i-lucide-megaphone', colorClass: 'text-amber-500' },
 *   }
 */
interface CellParams {
  value?: string | null
  fallback?: string
  colorClass?: string
}

const props = defineProps<{
  params?: CellParams
}>()

const iconName = computed(() => {
  const value = props.params?.value
  if (value && typeof value === 'string' && value.trim() !== '') return value
  return props.params?.fallback ?? 'i-lucide-square'
})

const colorClass = computed(() => props.params?.colorClass ?? '')
</script>
