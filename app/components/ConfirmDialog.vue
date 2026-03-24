<template>
  <UModal v-model:open="confirmState.open">
    <template #content>
      <div class="p-6 text-center">
        <UIcon
          v-if="confirmState.options.icon"
          :name="confirmState.options.icon"
          class="mx-auto h-10 w-10"
          :class="iconColor"
        />
        <h3 class="mt-3 text-lg font-semibold text-(--ui-text-highlighted)">
          {{ confirmState.options.title }}
        </h3>
        <p v-if="confirmState.options.description" class="mt-2 text-sm text-(--ui-text-muted)">
          {{ confirmState.options.description }}
        </p>
        <div class="mt-6 flex justify-center gap-3">
          <UButton variant="outline" @click="handleCancel">
            {{ confirmState.options.cancelLabel || t('Cancel') }}
          </UButton>
          <UButton :color="confirmState.options.color ?? 'primary'" @click="handleConfirm">
            {{ confirmState.options.confirmLabel || t('Confirm') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { state: confirmState, handleConfirm, handleCancel } = useConfirm()

const iconColor = computed(() => {
  const colors: Record<string, string> = {
    primary: 'text-(--ui-primary)',
    error: 'text-red-500',
    warning: 'text-amber-500',
  }
  return colors[confirmState.options.color ?? 'primary'] ?? 'text-(--ui-primary)'
})
</script>
