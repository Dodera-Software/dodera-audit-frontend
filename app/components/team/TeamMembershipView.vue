<template>
  <div class="flex flex-col gap-4">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="h-4 w-4 text-(--ui-primary)" />
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ props.teamName }}</h2>
        </div>
      </template>
      <p class="text-sm text-(--ui-text-muted)">{{ t('You are a member of this team') }}</p>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-triangle-alert" class="h-4 w-4 text-red-500" />
          <h2 class="text-sm font-semibold text-red-500">{{ t('Leave team') }}</h2>
        </div>
      </template>
      <p class="text-sm text-(--ui-text-muted)">{{ t('You will lose access to all shared projects.') }}</p>
      <div class="mt-3 flex justify-end">
        <UButton
          color="error"
          variant="outline"
          icon="i-lucide-log-out"
          :loading="props.loading"
          @click="emit('leave')"
        >
          {{ t('Leave team') }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface Props {
  teamName: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  leave: []
}>()

const { t } = useI18n()
</script>
