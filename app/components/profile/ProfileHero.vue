<template>
  <UCard>
    <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <!-- Avatar initials -->
      <div
        class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-(--ui-primary)/15 ring-4 ring-(--ui-primary)/20"
      >
        <span class="text-2xl font-bold text-(--ui-primary)">{{ userInitials }}</span>
      </div>

      <!-- Name / email / occupation -->
      <div class="flex-1 text-center sm:text-left">
        <h2 class="text-xl font-bold text-(--ui-text-highlighted)">{{ authStore.user?.name }}</h2>
        <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ authStore.user?.email }}</p>
        <p v-if="authStore.user?.occupation" class="mt-0.5 text-sm italic text-(--ui-text-dimmed)">
          {{ authStore.user.occupation }}
        </p>
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
const { formatDate } = useFormatters()

const userInitials = computed(() => {
  const name = authStore.user?.name ?? ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

const planBadgeColor = computed((): BadgeColor => {
  switch (authStore.user?.plan) {
    case 'pro': return 'primary'
    case 'max': return 'success'
    default: return 'neutral'
  }
})
</script>
