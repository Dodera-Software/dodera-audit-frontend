<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bell" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Notifications') }}</h2>
      </div>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-6">
      <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else class="divide-y divide-(--ui-border)">
      <div
        v-for="item in items"
        :key="item.key"
        class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ item.label }}</p>
          <p class="text-xs text-(--ui-text-muted)">{{ item.description }}</p>
        </div>
        <USwitch
          :model-value="preferences[item.key] ?? true"
          :disabled="saving[item.key] === true"
          @update:model-value="onToggle(item.key, $event)"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { NotificationType, type NotificationTypeValue } from '~/constants/notifications'

interface PreferenceItem {
  key: NotificationTypeValue
  label: string
  description: string
}

interface PreferencesResponse {
  preferences: Record<string, boolean>
}

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()

const preferences = reactive<Record<string, boolean>>({})
const saving = reactive<Record<string, boolean>>({})
const loading = ref(true)

const items = computed<PreferenceItem[]>(() => [
  {
    key: NotificationType.AuditCompleted,
    label: t('Audit completed'),
    description: t('Get notified when an audit finishes.'),
  },
  {
    key: NotificationType.AuditFailed,
    label: t('Audit failed'),
    description: t('Get alerted when an audit cannot be completed.'),
  },
  {
    key: NotificationType.TeamInvitationReceived,
    label: t('Team invitations'),
    description: t('When someone invites you to join a team.'),
  },
  {
    key: NotificationType.TeamInvitationAccepted,
    label: t('Team member joined'),
    description: t('When someone accepts an invitation you sent.'),
  },
  {
    key: NotificationType.SystemAnnouncement,
    label: t('PawByTech updates'),
    description: t('Product news, tips, and feature announcements.'),
  },
])

onMounted(async () => {
  try {
    const res = await $api<PreferencesResponse>('/notifications/preferences')
    Object.assign(preferences, res.preferences)
  }
  catch {
    toast.add({ title: t('Could not load notification preferences'), color: 'error' })
  }
  finally {
    loading.value = false
  }
})

async function onToggle(key: string, value: boolean) {
  const previous = preferences[key] ?? true
  preferences[key] = value
  saving[key] = true

  try {
    const res = await $api<PreferencesResponse>('/notifications/preferences', {
      method: 'PATCH',
      body: { preferences: { [key]: value } },
    })
    Object.assign(preferences, res.preferences)
  }
  catch {
    preferences[key] = previous
    toast.add({ title: t('Could not update preference'), color: 'error' })
  }
  finally {
    saving[key] = false
  }
}
</script>
