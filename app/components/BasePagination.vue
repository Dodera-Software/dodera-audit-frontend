<template>
  <div class="flex items-center justify-between pt-4">
    <p class="text-xs text-(--ui-text-muted)">
      Showing {{ from || 0 }}&ndash;{{ to || 0 }} of {{ total }}
    </p>

    <div class="flex items-center gap-1">
      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        icon="i-lucide-chevron-left"
        :disabled="currentPage <= 1"
        @click="emit('update:currentPage', currentPage - 1)"
      />

      <template v-if="pages.length > 0 && pages[0] > 1">
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          @click="emit('update:currentPage', 1)"
        >
          1
        </UButton>
        <span v-if="pages[0] > 2" class="px-1 text-xs text-(--ui-text-dimmed)">...</span>
      </template>

      <UButton
        v-for="page in pages"
        :key="page"
        size="xs"
        :variant="page === currentPage ? 'soft' : 'ghost'"
        :color="page === currentPage ? 'primary' : 'neutral'"
        @click="emit('update:currentPage', page)"
      >
        {{ page }}
      </UButton>

      <template v-if="pages.length > 0 && pages[pages.length - 1] < lastPage">
        <span v-if="pages[pages.length - 1] < lastPage - 1" class="px-1 text-xs text-(--ui-text-dimmed)">...</span>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          @click="emit('update:currentPage', lastPage)"
        >
          {{ lastPage }}
        </UButton>
      </template>

      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        icon="i-lucide-chevron-right"
        :disabled="currentPage >= lastPage"
        @click="emit('update:currentPage', currentPage + 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  currentPage: number
  lastPage: number
  total: number
  from: number
  to: number
  siblings?: number
}>(), {
  siblings: 2,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = computed(() => {
  const result: number[] = []
  const start = Math.max(1, props.currentPage - props.siblings)
  const end = Math.min(props.lastPage, props.currentPage + props.siblings)
  for (let i = start; i <= end; i++) result.push(i)
  return result
})
</script>
