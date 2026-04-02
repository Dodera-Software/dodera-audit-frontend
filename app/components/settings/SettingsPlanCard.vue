<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-zap" class="h-4 w-4 text-(--ui-primary)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Your plan') }}</h2>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Current plan row -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-(--ui-text-dimmed)">
            {{ t('Current plan') }}
          </p>
          <div class="mt-1 flex items-center gap-2">
            <span class="text-xl font-bold capitalize text-(--ui-text-highlighted)">
              {{ authStore.user?.plan }}
            </span>
            <UBadge :color="planBadgeColor" variant="subtle" size="xs">{{ t('Active') }}</UBadge>
          </div>
        </div>
        <UIcon name="i-lucide-crown" class="h-8 w-8 text-(--ui-primary)/20" />
      </div>

      <!-- Usage stats -->
      <div v-if="loading" class="space-y-2">
        <USkeleton class="h-5 w-full" />
        <USkeleton class="h-5 w-full" />
      </div>
      <div v-else-if="stats" class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-(--ui-text-muted)">
            <UIcon name="i-lucide-folder" class="h-4 w-4 shrink-0" />
            {{ t('Active projects') }}
          </div>
          <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ stats.projects_count }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-(--ui-text-muted)">
            <UIcon name="i-lucide-bar-chart-2" class="h-4 w-4 shrink-0" />
            {{ t('Audits this month') }}
          </div>
          <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ stats.audits_this_month }}</span>
        </div>
      </div>

      <!-- Upgrade section — only for non-Max users -->
      <template v-if="!isMax">
        <USeparator />

        <div>
          <p class="mb-2 text-sm text-(--ui-text-muted)">
            {{ t('Unlock more audits, team seats, and advanced AI features.') }}
          </p>
          <ul class="space-y-1.5">
            <li
              v-for="feature in upgradeFeatures"
              :key="feature"
              class="flex items-center gap-2 text-xs text-(--ui-text-muted)"
            >
              <UIcon name="i-lucide-check" class="h-3.5 w-3.5 shrink-0 text-(--ui-primary)" />
              {{ feature }}
            </li>
          </ul>
        </div>
      </template>

      <USeparator />

      <!-- CTAs -->
      <div class="space-y-2">
        <UButton v-if="!isMax" block icon="i-lucide-zap" to="/pricing">
          {{ t('Upgrade plan') }}
        </UButton>
        <UButton block variant="outline" icon="i-lucide-credit-card" to="/account/billing">
          {{ t('Manage billing') }}
        </UButton>
        <UButton block variant="ghost" icon="i-lucide-layout-grid" to="/projects">
          {{ t('View all projects') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BadgeColor } from '~/types'

interface UserStats {
  projects_count: number
  audits_this_month: number
}

const { t } = useI18n()
const authStore = useAuthStore()
const { isMax } = usePlan()
const { $api } = useApi()

const stats = ref<UserStats | null>(null)
const loading = ref(true)

const planBadgeColor = computed((): BadgeColor => {
  switch (authStore.user?.plan) {
    case 'pro': return 'primary'
    case 'max': return 'success'
    default: return 'neutral'
  }
})

const upgradeFeatures = computed(() => [
  t('More audits per month'),
  t('Bring your own OpenAI API key'),
  t('Invite team members'),
  t('Priority AI model access'),
  t('Advanced performance reports'),
])

onMounted(async () => {
  try {
    stats.value = await $api<UserStats>('/user/stats')
  } catch {}
  finally {
    loading.value = false
  }
})
</script>
