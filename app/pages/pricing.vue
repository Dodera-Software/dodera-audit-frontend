<template>
  <div class="min-h-screen bg-(--ui-bg) py-16">
    <div class="mx-auto max-w-5xl px-6">

      <!-- Header -->
      <div class="mb-12 text-center">
        <NuxtLink to="/dashboard" class="mb-6 inline-flex items-center gap-2 text-sm text-(--ui-text-muted) hover:text-(--ui-primary)">
          <UIcon name="i-lucide-arrow-left" class="h-3.5 w-3.5" />
          {{ t('Back to dashboard') }}
        </NuxtLink>
        <h1 class="text-4xl font-bold tracking-tight text-(--ui-text-highlighted)">{{ t('Simple, honest pricing') }}</h1>
        <p class="mt-3 text-lg text-(--ui-text-muted)">{{ t('Start free. Upgrade when you need more audits or your team grows.') }}</p>
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading" class="grid gap-6 md:grid-cols-3">
        <UiSkeletonPricingCard v-for="i in 3" :key="i" />
      </div>

      <!-- Plan cards -->
      <div v-else class="grid gap-6 md:grid-cols-3">

        <!-- Free -->
        <div class="flex flex-col rounded-2xl border border-(--ui-border) p-6">
          <h2 class="text-xl font-bold text-(--ui-text-highlighted)">Free</h2>
          <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('Try it out') }}</p>
          <div class="my-4">
            <span class="text-4xl font-bold text-(--ui-text-highlighted)">€0</span>
            <span class="text-sm text-(--ui-text-muted)"> / {{ t('forever') }}</span>
          </div>
          <ul class="mb-6 flex-1 space-y-2.5">
            <li v-for="f in (plans.free?.features ?? [])" :key="f" class="flex items-start gap-2 text-sm text-(--ui-text-muted)">
              <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {{ f }}
            </li>
            <li v-for="f in (plans.free?.locked ?? [])" :key="f" class="flex items-start gap-2 text-sm text-(--ui-text-dimmed) line-through">
              <UIcon name="i-lucide-x" class="mt-0.5 h-4 w-4 shrink-0 text-(--ui-text-dimmed)" />
              {{ f }}
            </li>
          </ul>
          <UButton v-if="isFree" block variant="outline" color="neutral" disabled>
            {{ t('Current plan') }}
          </UButton>
          <UButton v-else block variant="outline" color="neutral" to="/dashboard">
            {{ t('Stay on Free') }}
          </UButton>
        </div>

        <!-- Pro -->
        <div class="flex flex-col rounded-2xl border border-(--ui-border) p-6 shadow-sm">
          <h2 class="text-xl font-bold text-(--ui-text-highlighted)">Pro</h2>
          <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('For individuals & small teams') }}</p>
          <div class="my-4">
            <span class="text-4xl font-bold text-(--ui-text-highlighted)">€20</span>
            <span class="text-sm text-(--ui-text-muted)"> / {{ t('month') }}</span>
          </div>
          <ul class="mb-4 flex-1 space-y-2.5">
            <li v-for="f in (plans.pro?.features ?? [])" :key="f" class="flex items-start gap-2 text-sm text-(--ui-text-muted)">
              <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {{ f }}
            </li>
            <li v-for="f in (plans.pro?.locked ?? [])" :key="f" class="flex items-start gap-2 text-sm text-(--ui-text-dimmed) line-through">
              <UIcon name="i-lucide-x" class="mt-0.5 h-4 w-4 shrink-0 text-(--ui-text-dimmed)" />
              {{ f }}
            </li>
          </ul>
          <div class="mb-4 flex items-center justify-between rounded-lg border border-(--ui-border) px-3 py-2">
            <span class="text-xs text-(--ui-text-muted)">{{ t('Extra members') }} <span class="font-medium text-(--ui-text-highlighted)">{{ t('€10/mo') }}</span></span>
            <div class="flex items-center gap-2">
              <UButton icon="i-lucide-minus" size="xs" variant="ghost" color="neutral" :disabled="proSeats <= 0" @click="proSeats--" />
              <span class="w-4 text-center text-sm font-bold">{{ proSeats }}</span>
              <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="neutral" @click="proSeats++" />
            </div>
          </div>
          <UButton
            v-if="isPro && proSeats === 0"
            block
            variant="outline"
            color="neutral"
            disabled
          >
            {{ t('Current plan') }}
          </UButton>
          <UButton
            v-else
            block
            :loading="checkoutLoading === 'pro'"
            @click="checkout('pro', proSeats)"
          >
            {{ t('Get Pro') }} — €{{ 20 + proSeats * 10 }}{{ t('/mo') }}
          </UButton>
        </div>

        <!-- Max -->
        <div class="relative flex flex-col rounded-2xl border-2 border-(--ui-primary) p-6 shadow-lg">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span class="rounded-full bg-(--ui-primary) px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {{ t('Most popular') }}
            </span>
          </div>
          <h2 class="text-xl font-bold text-(--ui-text-highlighted)">Max</h2>
          <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('For agencies & power users') }}</p>
          <div class="my-4">
            <span class="text-4xl font-bold text-(--ui-text-highlighted)">€100</span>
            <span class="text-sm text-(--ui-text-muted)"> / {{ t('month') }}</span>
          </div>
          <ul class="mb-4 flex-1 space-y-2.5">
            <li v-for="f in (plans.max?.features ?? [])" :key="f" class="flex items-start gap-2 text-sm text-(--ui-text-muted)">
              <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {{ f }}
            </li>
          </ul>
          <div class="mb-4 flex items-center justify-between rounded-lg border border-(--ui-primary)/20 bg-(--ui-primary)/5 px-3 py-2">
            <span class="text-xs text-(--ui-text-muted)">{{ t('Extra members') }} <span class="font-medium text-(--ui-text-highlighted)">{{ t('€10/mo') }}</span></span>
            <div class="flex items-center gap-2">
              <UButton icon="i-lucide-minus" size="xs" variant="ghost" color="neutral" :disabled="maxSeats <= 0" @click="maxSeats--" />
              <span class="w-4 text-center text-sm font-bold">{{ maxSeats }}</span>
              <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="neutral" @click="maxSeats++" />
            </div>
          </div>
          <UButton
            v-if="isMax && maxSeats === 0"
            block
            variant="outline"
            color="neutral"
            disabled
          >
            {{ t('Current plan') }}
          </UButton>
          <UButton
            v-else
            block
            :loading="checkoutLoading === 'max'"
            @click="checkout('max', maxSeats)"
          >
            {{ t('Get Max') }} — €{{ 100 + maxSeats * 10 }}{{ t('/mo') }}
          </UButton>
        </div>
      </div>

      <!-- Manage existing subscription -->
      <div v-if="isPaid" class="mt-8 text-center">
        <UButton variant="ghost" color="neutral" icon="i-lucide-settings" :loading="portalLoading" @click="openPortal">
          {{ t('Manage subscription') }}
        </UButton>
      </div>

      <!-- FAQ -->
      <div class="mt-16 border-t border-(--ui-border) pt-12">
        <h2 class="mb-6 text-center text-xl font-bold text-(--ui-text-highlighted)">{{ t('Common questions') }}</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="faq in faqs" :key="faq.q" class="rounded-xl border border-(--ui-border) p-4">
            <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ faq.q }}</p>
            <p class="mt-1 text-sm text-(--ui-text-muted)">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlanInfo } from '~/composables/usePlan'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { $api } = useApi()
const { isFree, isPro, isMax, isPaid, redirectToPortal } = usePlan()
const toast = useToast()

const plans = ref<Record<string, PlanInfo>>({})
const loading = ref(true)
const checkoutLoading = ref<'pro' | 'max' | null>(null)
const portalLoading = ref(false)
const proSeats = ref(0)
const maxSeats = ref(0)

onMounted(async () => {
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
})

async function checkout(plan: 'pro' | 'max', extraSeats: number) {
  checkoutLoading.value = plan
  try {
    const data = await $api<{ checkout_url: string }>('/billing/checkout', {
      method: 'POST',
      body: { plan, seats: extraSeats },
    })
    window.location.href = data.checkout_url
  }
  catch {
    toast.add({ title: t('Failed to start checkout. Please try again.'), color: 'error' })
    checkoutLoading.value = null
  }
}

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

const faqs = computed(() => [
  {
    q: t('What counts as an audit?'),
    a: t('One full page scan and AI analysis counts as one audit. Partial re-scans also count.'),
  },
  {
    q: t('Can I cancel anytime?'),
    a: t('Yes. Cancel from the billing portal and your plan remains active until the end of the billing period.'),
  },
  {
    q: t('What are extra members?'),
    a: t('Each extra member gets their own login to collaborate on projects and view audit reports. Team management is coming soon.'),
  },
  {
    q: t('What is the custom OpenAI API key?'),
    a: t('Max plan users can connect their own OpenAI API key to run unlimited audits at their own cost. Add your key in account settings.'),
  },
])
</script>
