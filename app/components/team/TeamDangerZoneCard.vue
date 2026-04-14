<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-triangle-alert" class="h-4 w-4 text-red-500" />
        <h2 class="text-sm font-semibold text-red-500">{{ t('Danger zone') }}</h2>
      </div>
    </template>
    <p class="text-sm text-(--ui-text-muted)">{{ t('All members will lose access. This cannot be undone.') }}</p>
    <div class="mt-3 flex justify-end">
      <UButton
        color="error"
        variant="outline"
        icon="i-lucide-trash-2"
        :loading="props.loading"
        @click="emit('delete')"
      >
        {{ t('Delete team') }}
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  delete: []
}>()

const { t } = useI18n()
</script>
