<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bell" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Notifications') }}</h2>
      </div>
    </template>

    <div class="divide-y divide-(--ui-border)">
      <div
        v-for="item in notificationItems"
        :key="item.key"
        class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
      >
        <div>
          <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ item.label }}</p>
          <p class="text-xs text-(--ui-text-muted)">{{ item.description }}</p>
        </div>
        <USwitch v-model="notifications[item.key]" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface NotificationState {
  auditCompleted: boolean
  regressionDetected: boolean
  planExpiry: boolean
  newsletter: boolean
}

const { t } = useI18n()
const { isPaid } = usePlan()

// TODO: Wire to API when notification preferences endpoint is available
const notifications = reactive<NotificationState>({
  auditCompleted: true,
  regressionDetected: true,
  planExpiry: true,
  newsletter: false,
})

const notificationItems = computed(() => [
  {
    key: 'auditCompleted' as const,
    label: t('Audit completed'),
    description: t('Get notified when an audit finishes.'),
    show: true,
  },
  {
    key: 'regressionDetected' as const,
    label: t('Regression detected'),
    description: t('Get alerted when a score drops significantly.'),
    show: true,
  },
  {
    key: 'planExpiry' as const,
    label: t('Plan expiring soon'),
    description: t('Reminder 2 days before your subscription renews or expires.'),
    show: isPaid.value,
  },
  {
    key: 'newsletter' as const,
    label: t('PawByTech updates'),
    description: t('Receive tips, product news and feature announcements from PawByTech.'),
    show: true,
  },
].filter(item => item.show))
</script>
