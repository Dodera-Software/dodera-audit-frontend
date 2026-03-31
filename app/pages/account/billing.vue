<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-6 text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Billing & Plan') }}</h1>

    <!-- Success banner after checkout redirect -->
    <UAlert
      v-if="showSuccess"
      class="mb-6"
      color="success"
      variant="subtle"
      icon="i-lucide-check-circle"
      :title="t('Subscription activated!')"
      :description="t('Your plan has been upgraded. Enjoy your new features.')"
    />

    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <template v-else-if="status">
      <!-- Current plan card -->
      <UCard class="mb-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Current plan') }}</p>
            <div class="mt-1 flex items-center gap-2">
              <span class="text-2xl font-bold text-(--ui-text-highlighted)">{{ status.plan_label }}</span>
              <UBadge
                :color="status.plan === 'free' ? 'neutral' : 'success'"
                variant="subtle"
                size="xs"
              >
                {{ status.subscription_status === 'active' ? t('Active') : status.plan === 'free' ? t('Free') : t('Inactive') }}
              </UBadge>
              <UBadge v-if="status.on_grace_period" color="warning" variant="subtle" size="xs">
                {{ t('Canceling') }}
              </UBadge>
            </div>
            <p v-if="status.subscription_ends_at && status.on_grace_period" class="mt-1 text-xs text-(--ui-text-muted)">
              {{ t('Access until') }} {{ formatDate(status.subscription_ends_at) }}
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              v-if="status.plan !== 'free'"
              variant="outline"
              size="sm"
              icon="i-lucide-settings"
              :loading="portalLoading"
              @click="openPortal"
            >
              {{ t('Manage') }}
            </UButton>
            <UButton
              v-if="status.plan !== 'max'"
              size="sm"
              icon="i-lucide-zap"
              to="/pricing"
            >
              {{ status.plan === 'free' ? t('Upgrade') : t('Upgrade to Max') }}
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Usage card -->
      <UCard class="mb-4">
        <h3 class="mb-4 text-sm font-semibold text-(--ui-text-highlighted)">{{ t('This month\'s usage') }}</h3>

        <div class="space-y-4">
          <!-- Audits -->
          <div>
            <div class="mb-1.5 flex items-center justify-between text-sm">
              <span class="flex items-center gap-1.5 text-(--ui-text-muted)">
                {{ t('Audits') }}
                <UBadge v-if="status.has_own_api_key" color="success" variant="subtle" size="xs">
                  {{ t('Own API key') }}
                </UBadge>
              </span>
              <span class="font-semibold text-(--ui-text-highlighted)">
                {{ status.audits_this_month }} / {{ status.unlimited_audits ? '∞' : status.audit_limit }}
              </span>
            </div>
            <UProgress
              v-if="!status.unlimited_audits"
              :model-value="Math.min(100, Math.round((status.audits_this_month / status.audit_limit) * 100))"
              :max="100"
              :color="auditUsageColor"
              size="sm"
            />
          </div>

          <!-- Team seats -->
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-(--ui-text-muted)">{{ t('Team seats') }}</span>
              <span class="font-semibold text-(--ui-text-highlighted)">
                {{ status.included_seats + status.extra_seats }} {{ t('total') }}
                <span class="font-normal text-(--ui-text-dimmed)">({{ status.included_seats }} {{ t('included') }}<span v-if="status.extra_seats">, {{ status.extra_seats }} {{ t('extra') }}</span>)</span>
              </span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Upgrade CTA for free users -->
      <UCard v-if="status.plan === 'free'" class="border-(--ui-primary)/20 bg-(--ui-primary)/3">
        <div class="flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--ui-primary)/10">
            <UIcon name="i-lucide-zap" class="h-5 w-5 text-(--ui-primary)" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Unlock the full audit experience') }}</p>
            <p class="mt-0.5 text-xs text-(--ui-text-muted)">
              {{ t('Get persona insights, AI fix suggestions, Project Brain, and more.') }}
            </p>
          </div>
          <UButton size="sm" to="/pricing">{{ t('See plans') }}</UButton>
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { BillingStatus } from '~/composables/usePlan'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { $api } = useApi()
const route = useRoute()
const { formatDate } = useFormatters()
const { redirectToPortal } = usePlan()
const toast = useToast()

const status = ref<BillingStatus | null>(null)
const loading = ref(true)
const portalLoading = ref(false)
const showSuccess = ref(route.query.checkout === 'success')

onMounted(async () => {
  try {
    status.value = await $api<BillingStatus>('/billing/status')
  }
  catch {
    toast.add({ title: t('Failed to load billing info'), color: 'error' })
  }
  finally {
    loading.value = false
  }
})

const auditUsageColor = computed(() => {
  if (!status.value) return 'primary'
  const pct = Math.round((status.value.audits_this_month / status.value.audit_limit) * 100)
  if (pct >= 90) return 'error'
  if (pct >= 70) return 'warning'
  return 'primary'
})


async function openPortal() {
  portalLoading.value = true
  try {
    await redirectToPortal()
  }
  catch {
    toast.add({ title: t('Failed to open billing portal.'), color: 'error' })
    portalLoading.value = false
  }
}
</script>
