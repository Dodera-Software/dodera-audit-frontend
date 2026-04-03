<template>
  <UCard :ui="{ body: 'p-4' }">
    <div class="flex items-start justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium uppercase tracking-wider text-(--ui-text-dimmed)">{{ label }}</p>
        <p class="mt-1 text-2xl font-bold text-(--ui-text-highlighted)">{{ value }}</p>
        <div v-if="subtitle || (trend != null)" class="mt-1 flex items-center gap-1.5">
          <span v-if="trend != null" class="inline-flex items-center text-xs font-medium" :class="trend >= 0 ? 'text-emerald-600' : 'text-red-500'">
            <UIcon :name="trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="mr-0.5 h-3 w-3" />
            {{ trend > 0 ? '+' : '' }}{{ trend }}%
          </span>
          <span v-if="subtitle" class="truncate text-xs text-(--ui-text-dimmed)">{{ subtitle }}</span>
        </div>
      </div>
      <div
        class="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        :class="`bg-${color}-500/10`"
      >
        <UIcon :name="icon" class="h-5 w-5" :class="`text-${color}-500`" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  color: string
  subtitle?: string
  trend?: number | null
}>()
</script>
