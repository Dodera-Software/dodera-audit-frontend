<template>
  <UCard class="border-l-4 border-l-blue-500">
    <div class="flex items-start gap-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
        <UIcon name="i-lucide-eye" class="h-5 w-5" />
      </div>
      <div>
        <h3 class="font-semibold text-(--ui-text-highlighted)">{{ t('What a stranger sees in 5 seconds') }}</h3>
        <p class="mt-2 text-sm italic leading-relaxed text-(--ui-text-muted)">
          "{{ impression }}"
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  impression: string
}>()

const { t } = useI18n()
</script>
