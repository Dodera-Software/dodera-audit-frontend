<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-triangle-alert" class="h-4 w-4 text-red-500" />
        <h2 class="text-sm font-semibold text-red-500">{{ t('Danger zone') }}</h2>
      </div>
    </template>

    <p class="text-sm text-(--ui-text-muted)">
      {{ t('Once you delete your account, there is no going back.') }}
    </p>
    <UButton
      class="mt-3"
      color="error"
      variant="outline"
      size="sm"
      icon="i-lucide-trash-2"
      block
      disabled
    >
      {{ t('Delete account') }}
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
