<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="loading">
        <AdminKpiSkeleton />
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AdminChartSkeleton v-for="i in 2" :key="i" />
        </div>
      </template>

      <template v-else>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminKpiCard :label="t('MRR')" :value="formatCurrency(stats.mrr_cents)" icon="i-lucide-trending-up" color="primary" />
          <AdminKpiCard :label="t('ARR')" :value="formatCurrency(stats.arr_cents)" icon="i-lucide-calendar" color="primary" />
          <AdminKpiCard :label="t('ARPU')" :value="formatCurrency(stats.arpu_cents)" icon="i-lucide-user" color="primary" :subtitle="t('per user/month')" />
          <AdminKpiCard :label="t('Paid Users')" :value="stats.paid_users ?? 0" icon="i-lucide-credit-card" color="primary" :subtitle="`${stats.free_users ?? 0} free`" />
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Plan Breakdown') }}</h3>
            </template>
            <AdminDonutChart
              :labels="['Free', 'Pro', 'Max']"
              :values="[stats.plan_distribution?.free || 0, stats.plan_distribution?.pro || 0, stats.plan_distribution?.max || 0]"
              :colors="['#a1a1aa', '#3b82f6', '#8b5cf6']"
              :height="220"
              :empty-label="t('No users yet.')"
            />
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Revenue Sources') }}</h3>
            </template>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-(--ui-text-muted)">{{ t('Pro subscriptions') }}</span>
                <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ formatCurrency((stats.plan_distribution?.pro || 0) * 2000) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-(--ui-text-muted)">{{ t('Max subscriptions') }}</span>
                <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ formatCurrency((stats.plan_distribution?.max || 0) * 10000) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-(--ui-text-muted)">{{ t('Extra seats') }} ({{ stats.extra_seats_total ?? 0 }})</span>
                <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ formatCurrency(stats.extra_seats_revenue_cents) }}</span>
              </div>
              <USeparator />
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Total MRR') }}</span>
                <span class="text-sm font-bold text-emerald-600">{{ formatCurrency(stats.mrr_cents) }}</span>
              </div>
            </div>
          </UCard>
        </div>

        <UCard v-if="Object.keys(stats.subscription_statuses || {}).length > 0">
          <template #header>
            <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Stripe Subscription Statuses') }}</h3>
          </template>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div v-for="(count, status) in stats.subscription_statuses" :key="status" class="rounded-lg bg-(--ui-bg-elevated) p-3 text-center">
              <p class="text-lg font-bold text-(--ui-text-highlighted)">{{ count }}</p>
              <p class="text-xs capitalize text-(--ui-text-muted)">{{ String(status).replace(/_/g, ' ') }}</p>
            </div>
          </div>
        </UCard>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

onMounted(() => {
  setNavbar({ title: t('Revenue') })
})

const loading = ref(true)
const stats = ref<any>({})

function formatCurrency(cents: number): string {
  return `€${((cents || 0) / 100).toFixed(2)}`
}

onMounted(async () => {
  try {
    stats.value = await $api<any>('/admin/billing/stats')
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load billing stats.')).message, color: 'error' })
  }
  finally {
    loading.value = false
  }
})
</script>
