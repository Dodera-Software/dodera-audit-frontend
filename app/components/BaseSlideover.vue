<template>
  <USlideover v-model:open="open" :side="side">
    <template #content>
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-(--ui-border) px-5 py-4">
          <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">
            <slot name="title" />
          </h2>
          <UButton variant="ghost" icon="i-lucide-x" size="sm" @click="open = false" />
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="border-t border-(--ui-border) px-5 py-4">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

withDefaults(defineProps<{
  side?: 'left' | 'right'
}>(), {
  side: 'right',
})
</script>
