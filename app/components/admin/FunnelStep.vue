<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center gap-2">
        <span class="font-medium text-(--ui-text-highlighted)">{{ label }}</span>
        <span v-if="dropoff !== null" class="rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
          -{{ dropoff }}%
        </span>
      </div>
      <span class="tabular-nums text-(--ui-text-muted)">{{ count }} <span class="text-xs">({{ pct }}%)</span></span>
    </div>
    <div class="h-3 overflow-hidden rounded-full bg-(--ui-bg-elevated)">
      <div class="h-full rounded-full transition-all duration-700" :class="color" :style="{ width: `${pct}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  count: number
  total: number
  previous?: number
  color: string
}>()

const pct = computed(() => props.total > 0 ? Math.round((props.count / props.total) * 100) : 0)
const dropoff = computed(() => {
  if (props.previous === undefined || props.previous === 0) return null
  return Math.round(((props.previous - props.count) / props.previous) * 100)
})
</script>
