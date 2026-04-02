<template>
  <UCard>
    <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <!-- Avatar initials -->
      <div
        class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-(--ui-primary)/15 ring-4 ring-(--ui-primary)/20"
      >
        <span class="text-2xl font-bold text-(--ui-primary)">{{ userInitials }}</span>
      </div>

      <!-- Name / email -->
      <div class="flex-1 text-center sm:text-left">
        <h2 class="text-xl font-bold text-(--ui-text-highlighted)">{{ authStore.user?.name }}</h2>
        <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ authStore.user?.email }}</p>
      </div>

      <!-- Plan badge + member since -->
      <div class="flex flex-col items-center gap-2 sm:items-end">
        <UBadge
          :color="planBadgeColor"
          variant="subtle"
          class="px-3 py-1 text-xs font-semibold uppercase tracking-widest"
        >
          {{ authStore.user?.plan }}
        </UBadge>
        <p v-if="authStore.user?.created_at" class="text-xs text-(--ui-text-dimmed)">
          {{ t('Member since {date}', { date: formatDate(authStore.user.created_at) }) }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BadgeColor } from '~/types'

const { t } = useI18n()
const authStore = useAuthStore()
const { formatDate, getInitials } = useFormatters()

const userInitials = computed(() => getInitials(authStore.user?.name ?? ''))

const planBadgeColorMap: Record<string, BadgeColor> = {
  pro: 'primary',
  max: 'success',
}

const planBadgeColor = computed((): BadgeColor => planBadgeColorMap[authStore.user?.plan ?? ''] ?? 'neutral')
</script>
