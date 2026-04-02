<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Account') }}</h2>
      </div>
    </template>

    <div class="divide-y divide-(--ui-border)">
      <div class="py-2.5 first:pt-0 last:pb-0">
        <p class="text-xs text-(--ui-text-dimmed)">{{ t('Account ID') }}</p>
        <p class="mt-0.5 truncate font-mono text-xs text-(--ui-text-muted)">{{ authStore.user?.id }}</p>
      </div>

      <div class="py-2.5 first:pt-0 last:pb-0">
        <p class="text-xs text-(--ui-text-dimmed)">{{ t('Email status') }}</p>
        <div class="mt-0.5 flex items-center gap-1.5">
          <UIcon
            :name="authStore.isEmailVerified ? 'i-lucide-badge-check' : 'i-lucide-alert-circle'"
            :class="authStore.isEmailVerified ? 'text-emerald-500' : 'text-amber-500'"
            class="h-3.5 w-3.5 shrink-0"
          />
          <span class="text-xs text-(--ui-text-muted)">
            {{ authStore.isEmailVerified ? t('Verified') : t('Email not verified') }}
          </span>
        </div>
      </div>

      <div v-if="authStore.user?.created_at" class="py-2.5 first:pt-0 last:pb-0">
        <p class="text-xs text-(--ui-text-dimmed)">{{ t('Member since') }}</p>
        <p class="mt-0.5 text-xs font-medium text-(--ui-text-muted)">
          {{ formatDate(authStore.user.created_at) }}
        </p>
      </div>

      <div v-if="authStore.user?.team_role" class="py-2.5 first:pt-0 last:pb-0">
        <p class="text-xs text-(--ui-text-dimmed)">{{ t('Team role') }}</p>
        <p class="mt-0.5 text-xs font-medium capitalize text-(--ui-text-muted)">
          {{ authStore.user.team_role }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const { formatDate } = useFormatters()
</script>
