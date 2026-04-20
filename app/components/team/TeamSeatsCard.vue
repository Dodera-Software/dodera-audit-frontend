<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-armchair" class="h-4 w-4 text-(--ui-text-muted)" />
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Team seats') }}</h2>
        </div>
        <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-plus" @click="toggleBuySeats">
          {{ t('Buy seats') }}
        </UButton>
      </div>
    </template>

    <div class="space-y-5">
      <p class="text-sm text-(--ui-text-muted)">
        {{ t('{used} of {total} seats used', { used: props.membersCount, total: props.totalSeats }) }}<span v-if="props.billingStatus?.included_seats"> · {{ props.billingStatus.included_seats }} {{ t('included') }}</span><span v-if="props.billingStatus?.extra_seats">, {{ props.billingStatus.extra_seats }} {{ t('purchased') }}</span>
      </p>

      <!-- Buy seats inline form -->
      <div v-if="showBuySeats" class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-3">
        <p class="mb-2 text-xs text-(--ui-text-muted)">{{ t('Each extra seat costs €10/month and is added to your subscription.') }}</p>
        <div class="flex items-center gap-2">
          <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-minus" :disabled="seatsToBuy <= 1" @click="seatsToBuy = Math.max(1, seatsToBuy - 1)" />
          <span class="w-8 text-center text-sm font-semibold">{{ seatsToBuy }}</span>
          <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-plus" @click="seatsToBuy++" />
          <span class="ml-1 text-xs text-(--ui-text-muted)">× €10/mo = <strong>€{{ seatsToBuy * 10 }}/mo</strong></span>
          <UButton class="ml-auto" :loading="props.buyingSeats" @click="handleBuySeats">
            {{ t('Purchase') }}
          </UButton>
        </div>
      </div>

      <USeparator v-if="!props.hideInvite" />

      <!-- Invite form -->
      <div v-if="!props.hideInvite">
        <h3 class="mb-3 text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Invite a member') }}</h3>

        <UAlert
          v-if="props.seatLimitReached"
          class="mb-3"
          color="warning"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="t('No seats available')"
          :description="t('Purchase additional seats to invite more members.')"
        />

        <div class="flex gap-2">
          <UInput
            v-model="inviteEmail"
            type="email"
            size="lg"
            placeholder="colleague@example.com"
            class="flex-1"
            :disabled="props.seatLimitReached || props.inviteLoading"
            @keyup.enter="handleInvite"
          />
          <UButton
            :loading="props.inviteLoading"
            :disabled="props.seatLimitReached || !inviteEmail"
            icon="i-lucide-send"
            @click="handleInvite"
          >
            {{ t('Invite') }}
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BillingStatus } from '~/composables/usePlan'

interface Props {
  membersCount: number
  totalSeats: number
  billingStatus: BillingStatus | null
  seatLimitReached: boolean
  inviteLoading: boolean
  buyingSeats: boolean
  hideInvite?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  invite: [email: string]
  'buy-seats': [count: number]
}>()

const { t } = useI18n()

const inviteEmail = ref('')
const showBuySeats = ref(false)
const seatsToBuy = ref(1)

function toggleBuySeats() {
  showBuySeats.value = !showBuySeats.value
}

function handleInvite() {
  if (!inviteEmail.value) return
  emit('invite', inviteEmail.value)
  inviteEmail.value = ''
}

function handleBuySeats() {
  emit('buy-seats', seatsToBuy.value)
  showBuySeats.value = false
  seatsToBuy.value = 1
}
</script>
