<template>
  <ClientOnly>
    <div class="max-w-2xl space-y-6">
      <div class="flex items-center gap-4">
        <UButton variant="ghost" icon="i-lucide-arrow-left" size="xs" @click="router.back()" />
        <h1 class="font-display text-xl font-bold text-(--ui-text-highlighted)">{{ t('Settings') }}</h1>
      </div>

      <!-- Appearance -->
      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Appearance') }}</h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Theme') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('Choose how GhostAudit looks to you.') }}</p>
            </div>
            <div class="flex gap-1">
              <UButton
                v-for="mode in themeModes"
                :key="mode.value"
                :icon="mode.icon"
                :variant="colorMode.preference === mode.value ? 'soft' : 'ghost'"
                :color="colorMode.preference === mode.value ? 'primary' : 'neutral'"
                size="xs"
                @click="colorMode.preference = mode.value"
              >
                {{ mode.label }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Notifications (placeholder) -->
      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Notifications') }}</h2>
        </template>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Audit completed') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('Get notified when an audit finishes.') }}</p>
            </div>
            <USwitch v-model="notifications.auditCompleted" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Regression detected') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('Get alerted when a score drops significantly.') }}</p>
            </div>
            <USwitch v-model="notifications.regressionDetected" />
          </div>
        </div>
      </UCard>

      <!-- Danger zone -->
      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-red-500">{{ t('Danger zone') }}</h2>
        </template>
        <p class="text-sm text-(--ui-text-muted)">{{ t('Once you delete your account, there is no going back.') }}</p>
        <UButton class="mt-3" color="error" variant="outline" size="sm" disabled>
          {{ t('Delete account') }}
        </UButton>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const router = useRouter()
const colorMode = useColorMode()

const themeModes = computed(() => [
  { value: 'light', icon: 'i-lucide-sun', label: t('Light') },
  { value: 'dark', icon: 'i-lucide-moon', label: t('Dark') },
  { value: 'system', icon: 'i-lucide-monitor', label: t('System') },
])

// Placeholder — will be wired to API later
const notifications = reactive({
  auditCompleted: true,
  regressionDetected: true,
})
</script>
