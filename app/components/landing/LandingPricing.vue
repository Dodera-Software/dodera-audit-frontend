<template>
  <section id="pricing" class="px-6 py-28">
    <div class="mx-auto max-w-5xl">
      <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white">{{ t('Pricing') }}</p>
      <h2 class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl">
        {{ t('Simple, transparent') }}
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{{ t('pricing.') }}</span>
      </h2>
      <p class="mx-auto mb-16 max-w-lg text-center text-lg text-zinc-400">
        <span class="font-bold text-white">{{ t('Start free.') }}</span> {{ t('Upgrade when you need more audits or your team grows.') }}
      </p>

      <div class="grid gap-6 md:grid-cols-3">
        <!-- Free -->
        <NuxtLink to="/register" class="flex flex-col rounded-3xl border border-white/10 bg-black/25 p-7 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-emerald-400/60 hover:shadow-[0_8px_50px_rgba(16,185,129,0.12)]">
          <h3 class="text-xl font-black text-white">Free</h3>
          <p class="mt-1 text-sm text-zinc-500">{{ t('Try it out') }}</p>
          <div class="my-5">
            <span class="text-4xl font-black text-white">€0</span>
            <span class="text-sm text-zinc-500"> / {{ t('forever') }}</span>
          </div>
          <ul class="mb-6 flex-1 space-y-3">
            <li v-for="f in freeFeatures" :key="f" class="flex items-start gap-2.5 text-sm text-zinc-300">
              <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              {{ f }}
            </li>
            <li v-for="f in freeLocked" :key="f" class="flex items-start gap-2.5 text-sm text-zinc-600 line-through">
              <UIcon name="i-lucide-x" class="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
              {{ f }}
            </li>
          </ul>
          <span
            class="block rounded-xl border border-white/12 bg-white/5 py-3 text-center text-sm font-semibold text-zinc-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            {{ t('Get started free') }}
          </span>
        </NuxtLink>

        <!-- Pro -->
        <NuxtLink to="/register" class="flex flex-col rounded-3xl border border-white/10 bg-black/25 p-7 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-emerald-400/60 hover:shadow-[0_8px_50px_rgba(16,185,129,0.12)]">
          <h3 class="text-xl font-black text-white">Pro</h3>
          <p class="mt-1 text-sm text-zinc-500">{{ t('For individuals & small teams') }}</p>
          <div class="my-5">
            <span class="text-4xl font-black text-white">€20</span>
            <span class="text-sm text-zinc-500"> / {{ t('month') }}</span>
          </div>
          <ul class="mb-4 flex-1 space-y-3">
            <li v-for="f in proFeatures" :key="f" class="flex items-start gap-2.5 text-sm text-zinc-300">
              <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              {{ f }}
            </li>
            <li v-for="f in proLocked" :key="f" class="flex items-start gap-2.5 text-sm text-zinc-600 line-through">
              <UIcon name="i-lucide-x" class="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
              {{ f }}
            </li>
          </ul>
          <div class="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
            <span class="text-xs text-zinc-400">{{ t('Extra members') }} <span class="font-semibold text-zinc-200">{{ t('€10/mo') }}</span></span>
            <div class="flex items-center gap-2.5">
              <button
                class="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-30"
                :disabled="proSeats <= 0"
                :aria-label="t('Remove seat')"
                @click.prevent="proSeats--"
              >
                <UIcon name="i-lucide-minus" class="h-3.5 w-3.5" />
              </button>
              <span class="w-4 text-center text-sm font-bold text-white">{{ proSeats }}</span>
              <button
                class="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                :aria-label="t('Add seat')"
                @click.prevent="proSeats++"
              >
                <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <span
            class="block rounded-xl border border-emerald-500/50 bg-emerald-500/10 py-3 text-center text-sm font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
          >
            {{ t('Get Pro') }} — €{{ 20 + proSeats * 10 }}{{ t('/mo') }}
          </span>
        </NuxtLink>

        <!-- Max -->
        <NuxtLink to="/register" class="relative flex flex-col rounded-3xl border-2 border-emerald-500/40 bg-black/25 p-7 shadow-[0_0_60px_rgba(16,185,129,0.1)] backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-emerald-400/60 hover:shadow-[0_8px_50px_rgba(16,185,129,0.2)]">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span class="rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-black">
              {{ t('Most popular') }}
            </span>
          </div>
          <h3 class="text-xl font-black text-white">Max</h3>
          <p class="mt-1 text-sm text-zinc-500">{{ t('For agencies & power users') }}</p>
          <div class="my-5">
            <span class="text-4xl font-black text-white">€100</span>
            <span class="text-sm text-zinc-500"> / {{ t('month') }}</span>
          </div>
          <ul class="mb-4 flex-1 space-y-3">
            <li v-for="f in maxFeatures" :key="f" class="flex items-start gap-2.5 text-sm text-zinc-300">
              <UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              {{ f }}
            </li>
          </ul>
          <div class="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
            <span class="text-xs text-zinc-400">{{ t('Extra members') }} <span class="font-semibold text-zinc-200">{{ t('€10/mo') }}</span></span>
            <div class="flex items-center gap-2.5">
              <button
                class="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-500/20 text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-white disabled:opacity-30"
                :disabled="maxSeats <= 0"
                :aria-label="t('Remove seat')"
                @click.prevent="maxSeats--"
              >
                <UIcon name="i-lucide-minus" class="h-3.5 w-3.5" />
              </button>
              <span class="w-4 text-center text-sm font-bold text-white">{{ maxSeats }}</span>
              <button
                class="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-500/20 text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-white"
                :aria-label="t('Add seat')"
                @click.prevent="maxSeats++"
              >
                <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <span
            class="block rounded-xl bg-emerald-500 py-3 text-center text-sm font-bold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            {{ t('Get Max') }} — €{{ 100 + maxSeats * 10 }}{{ t('/mo') }}
          </span>
        </NuxtLink>
      </div>

      <!-- FAQ -->
      <div class="mt-20 border-t border-white/10 pt-14">
        <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white">{{ t('FAQ') }}</p>
        <h3 class="mb-8 text-center text-2xl font-black text-white">{{ t('Common questions') }}</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="(faq, index) in faqs" :key="faq.q" :class="[
            'rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm',
            faqs.length % 2 === 1 && index === faqs.length - 1 && 'md:col-span-2 md:mx-auto md:max-w-[calc(50%-0.5rem)]',
          ]">
            <p class="text-sm font-semibold text-white">{{ faq.q }}</p>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const proSeats = ref(0)
const maxSeats = ref(0)

const freeFeatures = computed(() => [
  t('1 audit per month'),
  t('1 audit page'),
  t('Core AI scoring (6 dimensions)'),
  t('3 Issues preview'),
])

const freeLocked = computed(() => [
  t('Persona insights & verdicts'),
  t('AI fix suggestions'),
  t('Project Brain narrative'),
  t('Team members'),
])

const proFeatures = computed(() => [
  t('5 audits per month'),
  t('10 audit pages'),
  t('Full AI report access'),
  t('All persona insights & verdicts'),
  t('AI fix suggestions on every issue'),
  t('Project Brain narrative'),
  t('Priority recommendations'),
  t('Extra members at €10/month each'),
])

const proLocked = computed(() => [
  t('Custom OpenAI API key'),
  t('Unlimited audits (with own key)'),
])

const maxFeatures = computed(() => [
  t('50 audits per month'),
  t('Unlimited audit pages'),
  t('4 team seats included (you + 3 members)'),
  t('Full AI report access'),
  t('All persona insights & verdicts'),
  t('AI fix suggestions on every issue'),
  t('Project Brain narrative'),
  t('Connect your own OpenAI API key'),
  t('Unlimited audits with own key'),
  t('Extra members at €10/month each'),
])

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
  {
    q: t('Is there a tutorial for new users?'),
    a: t('Yes! Every new user gets a free interactive tutorial inside the app that walks you through your first audit step by step — no prior experience needed.'),
  },
])
</script>
