<template>
  <div class="flex flex-col gap-4">
    <!-- Free plan upsell -->
    <UCard v-if="props.isFree" class="border-(--ui-primary)/20 bg-(--ui-primary)/3">
      <div class="flex items-start gap-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--ui-primary)/10">
          <UIcon name="i-lucide-users" class="h-5 w-5 text-(--ui-primary)" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Teams are available on paid plans') }}</p>
          <p class="mt-0.5 text-xs text-(--ui-text-muted)">
            {{ t('Upgrade to Pro or Max to invite team members and collaborate on audit pages.') }}
          </p>
        </div>
        <UButton to="/pricing">{{ t('Upgrade plan') }}</UButton>
      </div>
    </UCard>

    <!-- Create team form -->
    <UCard v-else>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="h-4 w-4 text-(--ui-primary)" />
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Create your team') }}</h2>
        </div>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-(--ui-text-muted)">{{ t('Invite teammates to collaborate on your audit pages.') }}</p>
        <UInput v-model="newTeamName" :placeholder="t('Team name')" size="lg" />
        <UButton block :loading="props.loading" :disabled="!newTeamName.trim()" @click="handleCreate">
          {{ t('Create team') }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isFree: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  create: [name: string]
}>()

const { t } = useI18n()

const newTeamName = ref('')

function handleCreate() {
  if (!newTeamName.value.trim()) return
  emit('create', newTeamName.value.trim())
  newTeamName.value = ''
}
</script>
