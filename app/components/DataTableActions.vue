<template>
  <div v-if="actions.length > 0" class="flex h-full items-center justify-center">
    <UDropdownMenu :items="actions">
      <UButton
        icon="i-lucide-ellipsis-vertical"
        variant="ghost"
        color="neutral"
        size="xs"
        square
      />
    </UDropdownMenu>
  </div>
</template>

<script setup lang="ts">
import type { RowAction } from '~/components/BaseDataTable.vue'

defineProps<{
  actions: RowAction[]
}>()
</script>
