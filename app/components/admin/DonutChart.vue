<template>
  <div v-if="hasData">
    <component
      :is="resolveComponent('DonutChart')"
      :data="values"
      :categories="chartCategories"
      :height="height"
      :radius="4"
      :arc-width="arcWidth"
      :legend-style="{ marginTop: '12px' }"
      type="full"
      :duration="400"
    >
      <template #tooltip="{ values: tipValues }">
        <div class="rounded-lg border border-(--ui-border) bg-(--ui-bg) px-3 py-2 text-xs shadow-lg">
          <template v-for="(val, key) in tipValues" :key="key">
            <div v-if="String(key) !== 'label'" class="flex items-center gap-2">
              <span
                class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                :style="{ backgroundColor: getCategoryColor(String(key)) }"
              />
              <span class="text-(--ui-text)">{{ getCategoryName(String(key)) }}</span>
              <span class="ml-auto font-semibold tabular-nums text-(--ui-text-highlighted)">{{ val }}</span>
            </div>
          </template>
        </div>
      </template>
    </component>
  </div>
  <div v-else class="flex flex-col items-center justify-center py-8 text-center" :style="{ minHeight: `${height}px` }">
    <UIcon name="i-lucide-pie-chart" class="mb-2 h-8 w-8 text-(--ui-text-dimmed)" />
    <p class="text-sm text-(--ui-text-muted)">{{ emptyLabel || 'No data yet.' }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  labels: string[]
  values: number[]
  height?: number
  colors?: string[]
  emptyLabel?: string
  arcWidth?: number
}>(), {
  height: 260,
  arcWidth: 50,
})

const hasData = computed(() => props.values.length > 0 && props.values.some(v => v > 0))

const defaultColors = ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

const chartCategories = computed(() => {
  const colors = props.colors || defaultColors
  const cats: Record<string, { name: string, color: string }> = {}
  props.labels.forEach((label, i) => {
    const key = label.replace(/\s+/g, '_').toLowerCase()
    cats[key] = { name: label, color: colors[i % colors.length] }
  })
  return cats
})

function findCategory(key: string): { name: string, color: string } | undefined {
  const cats = chartCategories.value
  // Direct match
  if (cats[key]) return cats[key]
  // Lowercase match
  const lower = key.replace(/\s+/g, '_').toLowerCase()
  if (cats[lower]) return cats[lower]
  // Search by name
  return Object.values(cats).find(c => c.name === key)
}

function getCategoryColor(key: string): string {
  return findCategory(key)?.color ?? '#a1a1aa'
}

function getCategoryName(key: string): string {
  return findCategory(key)?.name ?? key
}
</script>
