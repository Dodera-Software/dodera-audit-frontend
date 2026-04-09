<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-users" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">
          {{ t('Members') }}
          <span class="ml-1 font-normal text-(--ui-text-dimmed)">({{ props.members.length }}/{{ props.totalSeats }} {{ t('seats used') }})</span>
        </h2>
      </div>
    </template>

    <div v-if="props.members.length > 0" class="space-y-3">
      <div
        v-for="member in props.members"
        :key="member.id"
        class="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-(--ui-bg-elevated)"
      >
        <div class="flex items-center gap-2.5">
          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-(--ui-primary)/15 text-xs font-semibold text-(--ui-primary)">
            {{ member.user?.name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-sm font-medium text-(--ui-text-highlighted)">
              {{ member.user?.name }}
              <UBadge v-if="member.role === 'owner'" color="neutral" variant="subtle" size="xs" class="ml-1">{{ t('Owner') }}</UBadge>
            </p>
            <p class="text-xs text-(--ui-text-muted)">{{ member.user?.email }}</p>
          </div>
        </div>
        <UButton
          v-if="member.role !== 'owner'"
          size="sm"
          variant="ghost"
          color="error"
          icon="i-lucide-user-minus"
          :loading="props.removingId === member.id"
          @click="emit('remove', member)"
        >
          {{ t('Remove') }}
        </UButton>
      </div>
    </div>
    <p v-else class="text-sm text-(--ui-text-muted)">{{ t('No members yet. Invite someone below.') }}</p>
  </UCard>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/composables/useTeam'

interface Props {
  members: TeamMember[]
  totalSeats: number
  removingId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [member: TeamMember]
}>()

const { t } = useI18n()
</script>
