<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--ui-primary)/10">
          <UIcon name="i-lucide-sparkles" class="h-7 w-7 text-(--ui-primary)" />
        </div>

        <h2 class="text-xl font-bold text-(--ui-text-highlighted)">{{ t('Upgrade to add more seats') }}</h2>
        <p class="mt-2 max-w-sm mx-auto text-sm text-(--ui-text-muted)">
          {{ t('Purchasing additional team seats requires a Pro or Max subscription. Upgrade your plan to collaborate with more team members.') }}
        </p>

        <div class="mt-8 flex justify-center gap-3">
          <UButton variant="outline" color="neutral" @click="emit('close')">
            {{ t('Cancel') }}
          </UButton>
          <UButton to="/pricing" icon="i-lucide-arrow-up-circle" @click="emit('close')">
            {{ t('Upgrade plan') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  close: []
}>()
</script>
