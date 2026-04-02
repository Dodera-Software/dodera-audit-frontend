<template>
  <UCard v-if="!isMax">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-zap" class="h-4 w-4 text-(--ui-primary)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Upgrade your plan') }}</h2>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm text-(--ui-text-muted)">
        {{ t('Unlock more audits, team seats, and advanced AI features.') }}
      </p>

      <ul class="space-y-2">
        <li
          v-for="feature in upgradeFeatures"
          :key="feature"
          class="flex items-center gap-2 text-xs text-(--ui-text-muted)"
        >
          <UIcon name="i-lucide-check" class="h-3.5 w-3.5 shrink-0 text-(--ui-primary)" />
          {{ feature }}
        </li>
      </ul>

      <USeparator />

      <div class="space-y-2">
        <UButton block icon="i-lucide-zap" to="/pricing">
          {{ t('View pricing') }}
        </UButton>
        <UButton block variant="ghost" icon="i-lucide-credit-card" to="/account/billing">
          {{ t('Manage billing') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { isMax } = usePlan()

const upgradeFeatures = computed(() => [
  t('More audits per month'),
  t('Bring your own OpenAI API key'),
  t('Invite team members'),
  t('Priority AI model access'),
  t('Advanced performance reports'),
])
</script>
