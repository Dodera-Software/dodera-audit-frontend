<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-mail" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Pending invitations') }}</h2>
      </div>
    </template>
    <div class="space-y-3">
      <div
        v-for="inv in props.invitations"
        :key="inv.id"
        class="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
      >
        <div>
          <p class="text-sm text-(--ui-text-highlighted)">{{ inv.email }}</p>
          <p class="text-xs text-(--ui-text-muted)">{{ t('Expires') }} {{ formatDate(inv.expires_at) }}</p>
        </div>
        <UButton
          size="sm"
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          :loading="props.revokingId === inv.id"
          @click="emit('revoke', inv.id)"
        >
          {{ t('Revoke') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { TeamInvitation } from '~/composables/useTeam'

interface Props {
  invitations: TeamInvitation[]
  revokingId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  revoke: [id: string]
}>()

const { t } = useI18n()
const { formatDate } = useFormatters()
</script>
