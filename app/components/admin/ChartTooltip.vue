<template>
  <div class="rounded-lg border border-(--ui-border) bg-(--ui-bg) px-3 py-2 text-xs shadow-lg">
    <p v-if="title" class="mb-1 font-medium text-(--ui-text-highlighted)">{{ title }}</p>
    <template v-for="(val, key) in displayValues" :key="key">
      <div class="flex items-center gap-2">
        <span
          class="inline-block h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: categories[String(key)]?.color ?? '#a1a1aa' }"
        />
        <span class="text-(--ui-text-muted)">{{ categories[String(key)]?.name ?? key }}</span>
        <span class="ml-auto font-semibold tabular-nums text-(--ui-text-highlighted)">{{ val }}</span>
      </div>
    </template>
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
  for (const [key, val] of Object.entries(props.values ?? {})) {
    if (key !== '_label') {
      filtered[key] = val
    }
  }
  return filtered
})
</script>
