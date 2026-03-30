<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-4xl' }">
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="mb-6 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--ui-primary)/10">
            <UIcon name="i-lucide-zap" class="h-6 w-6 text-(--ui-primary)" />
          </div>
          <h2 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Upgrade your plan') }}</h2>
          <p class="mt-1 text-sm text-(--ui-text-muted)">{{ props.reason || t('Unlock the full power of PawByTech') }}</p>
        </div>

        <!-- Plan cards -->
        <div v-if="loading" class="flex justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-(--ui-text-muted)" />
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2">
          <!-- Pro -->
          <div
            class="relative flex flex-col rounded-2xl border p-5 transition-all"
            :class="selectedPlan === 'pro' ? 'border-(--ui-primary) bg-(--ui-primary)/5 shadow-lg' : 'border-(--ui-border) hover:border-(--ui-primary)/50'"
          >
            <div class="mb-4 flex items-start justify-between">
              <div>
                <h3 class="text-lg font-bold text-(--ui-text-highlighted)">Pro</h3>
                <p class="text-xs text-(--ui-text-muted)">{{ t('For individuals & small teams') }}</p>
              </div>
              <div class="text-right">
                <span class="text-2xl font-bold text-(--ui-text-highlighted)">€20</span>
                <span class="text-xs text-(--ui-text-muted)">{{ t('/month') }}</span>
              </div>
            </div>

            <ul class="mb-5 flex-1 space-y-2">
              <li v-for="f in (plans.pro?.features ?? [])" :key="f" class="flex items-start gap-2 text-xs text-(--ui-text-muted)">
                <UIcon name="i-lucide-check" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                {{ f }}
              </li>
            </ul>

            <!-- Extra seats selector -->
            <div class="mb-4 flex items-center justify-between rounded-lg border border-(--ui-border) px-3 py-2">
              <span class="text-xs text-(--ui-text-muted)">{{ t('Extra members') }} <span class="font-medium text-(--ui-text-highlighted)">{{ t('€10/mo each') }}</span></span>
              <div class="flex items-center gap-2">
                <UButton icon="i-lucide-minus" size="xs" variant="ghost" color="neutral" :disabled="proExtraSeats <= 0" @click="proExtraSeats--" />
                <span class="w-4 text-center text-sm font-semibold">{{ proExtraSeats }}</span>
                <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="neutral" @click="proExtraSeats++" />
              </div>
            </div>

            <UButton
              block
              :variant="selectedPlan === 'pro' ? 'solid' : 'outline'"
              :loading="checkoutLoading && selectedPlan === 'pro'"
              @click="handleCheckout('pro', proExtraSeats)"
            >
              {{ t('Start with Pro') }} — €{{ 20 + proExtraSeats * 10 }}{{ t('/mo') }}
            </UButton>
          </div>

          <!-- Max -->
          <div
            class="relative flex flex-col rounded-2xl border p-5 transition-all"
            :class="selectedPlan === 'max' ? 'border-(--ui-primary) bg-(--ui-primary)/5 shadow-lg' : 'border-(--ui-border) hover:border-(--ui-primary)/50'"
          >
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span class="rounded-full bg-(--ui-primary) px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                {{ t('Best value') }}
              </span>
            </div>

            <div class="mb-4 flex items-start justify-between">
              <div>
                <h3 class="text-lg font-bold text-(--ui-text-highlighted)">Max</h3>
                <p class="text-xs text-(--ui-text-muted)">{{ t('For agencies & power users') }}</p>
              </div>
              <div class="text-right">
                <span class="text-2xl font-bold text-(--ui-text-highlighted)">€100</span>
                <span class="text-xs text-(--ui-text-muted)">{{ t('/month') }}</span>
              </div>
            </div>

            <ul class="mb-5 flex-1 space-y-2">
              <li v-for="f in (plans.max?.features ?? [])" :key="f" class="flex items-start gap-2 text-xs text-(--ui-text-muted)">
                <UIcon name="i-lucide-check" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                {{ f }}
              </li>
            </ul>

            <!-- Extra seats selector -->
            <div class="mb-4 flex items-center justify-between rounded-lg border border-(--ui-border) px-3 py-2">
              <span class="text-xs text-(--ui-text-muted)">{{ t('Extra members') }} <span class="font-medium text-(--ui-text-highlighted)">{{ t('€10/mo each') }}</span></span>
              <div class="flex items-center gap-2">
                <UButton icon="i-lucide-minus" size="xs" variant="ghost" color="neutral" :disabled="maxExtraSeats <= 0" @click="maxExtraSeats--" />
                <span class="w-4 text-center text-sm font-semibold">{{ maxExtraSeats }}</span>
                <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="neutral" @click="maxExtraSeats++" />
              </div>
            </div>

            <UButton
              block
              :loading="checkoutLoading && selectedPlan === 'max'"
              @click="handleCheckout('max', maxExtraSeats)"
            >
              {{ t('Start with Max') }} — €{{ 100 + maxExtraSeats * 10 }}{{ t('/mo') }}
            </UButton>
          </div>
        </div>

        <p class="mt-4 text-center text-xs text-(--ui-text-dimmed)">
          {{ t('Secure checkout via Stripe. Cancel anytime.') }}
        </p>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { PlanInfo } from '~/composables/usePlan'

const props = withDefaults(defineProps<{
  reason?: string
}>(), {
  reason: undefined,
})

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()

const plans = ref<Record<string, PlanInfo>>({})
const loading = ref(false)
const checkoutLoading = ref(false)
const selectedPlan = ref<'pro' | 'max' | null>(null)
const proExtraSeats = ref(0)
const maxExtraSeats = ref(0)

watch(open, async (val) => {
  if (val && !Object.keys(plans.value).length) {
    loading.value = true
    try {
      const data = await $api<{ data: Record<string, PlanInfo> }>('/billing/plans')
      plans.value = data.data
    }
    catch {
      toast.add({ title: t('Failed to load plans'), color: 'error' })
    }
    finally {
      loading.value = false
    }
  }
})

async function handleCheckout(plan: 'pro' | 'max', extraSeats: number) {
  selectedPlan.value = plan
  checkoutLoading.value = true
  try {
    const data = await $api<{ checkout_url: string }>('/billing/checkout', {
      method: 'POST',
      body: { plan, seats: extraSeats },
    })
    window.location.href = data.checkout_url
  }
  catch {
    toast.add({ title: t('Failed to start checkout'), color: 'error' })
    checkoutLoading.value = false
    selectedPlan.value = null
  }
}
</script>
