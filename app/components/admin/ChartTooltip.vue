<template>
  <div v-if="hasContent" class="rounded-lg border border-(--ui-border) bg-(--ui-bg) px-3 py-2 text-xs shadow-lg">
    <p v-if="title" class="mb-1 font-medium text-(--ui-text-highlighted)">{{ title }}</p>
    <div v-for="(val, key) in displayValues" :key="key" class="flex items-center gap-2">
      <span
        class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        :style="{ backgroundColor: findColor(String(key)) }"
      />
      <span class="text-(--ui-text-muted)">{{ findName(String(key)) }}</span>
      <span class="ml-auto font-semibold tabular-nums text-(--ui-text-highlighted)">{{ val }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  values: Record<string, unknown>
  categories: Record<string, { name: string, color: string }>
}>()

const title = computed(() => {
  const label = props.values?._label
  return label ? String(label) : null
})

const displayValues = computed(() => {
  const filtered: Record<string, unknown> = {}
  if (!props.values) return filtered
  for (const [key, val] of Object.entries(props.values)) {
    if (key !== '_label' && key !== 'label') {
      filtered[key] = val
    }
  }
  return filtered
})

const hasContent = computed(() => Object.keys(displayValues.value).length > 0)

function findColor(key: string): string {
  if (props.categories[key]) return props.categories[key].color
  const lower = key.replace(/\s+/g, '_').toLowerCase()
  if (props.categories[lower]) return props.categories[lower].color
  const match = Object.values(props.categories).find(c => c.name === key)
  return match?.color ?? '#a1a1aa'
}

function findName(key: string): string {
  if (props.categories[key]) return props.categories[key].name
  const lower = key.replace(/\s+/g, '_').toLowerCase()
  if (props.categories[lower]) return props.categories[lower].name
  return key
}
</script>
