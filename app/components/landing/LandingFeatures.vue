<template>
  <div>
    <!-- ── Ticker ── -->
    <div class="relative overflow-hidden border-y border-white/8 bg-black/15 py-4">
      <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-800" />
      <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-800" />
      <div class="flex animate-marquee whitespace-nowrap">
        <span
          v-for="item in [...tickerItems, ...tickerItems]"
          :key="item.id"
          class="mx-10 flex items-center gap-3 text-sm font-medium text-zinc-500"
        >
          <UIcon :name="item.icon" class="h-4 w-4 text-emerald-500/60" />
          <span>{{ item.text }}</span>
          <span class="text-zinc-700">·</span>
        </span>
      </div>
    </div>

    <!-- ── Bento grid ── -->
    <section id="features" class="px-6 py-28">
      <div class="mx-auto max-w-7xl">
        <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white">{{ t('What you get') }}</p>
        <h2 class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl">
          {{ t('Everything analytics') }}<br />
          <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{{ t("can't tell you.") }}</span>
        </h2>
        <p class="mx-auto mb-16 max-w-xl text-center text-lg text-zinc-400">
          {{ t('AI perspectives your analytics dashboard never shows you. And so easy to use!') }}
        </p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">

          <!-- Large hero card -->
          <div class="col-span-1 overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-8 backdrop-blur-sm md:col-span-2">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <UIcon name="i-lucide-users" class="h-6 w-6 text-emerald-400" />
            </div>
            <h3 class="mt-6 text-2xl font-black text-white md:text-3xl">{{ t('7+ AI Persona Agents') }}</h3>
            <p class="mt-3 max-w-lg text-base leading-relaxed text-zinc-400">
              {{ t('Each persona thinks differently. The Skeptic needs proof. The Impulse Visitor decides in 5 seconds. The Comparison Shopper has three tabs open. They all evaluate your page simultaneously.') }}
            </p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="tag in personaTags"
                :key="tag"
                class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mt-8 flex justify-center opacity-75 md:justify-start">
                <UiLottie src="/animations/searching.json" :height="150" :width="240" />
            </div>
          </div>

          <!-- Conversion Scoring -->
          <div class="rounded-3xl border border-white/10 bg-black/25 p-7 backdrop-blur-sm">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <UIcon name="i-lucide-target" class="h-5 w-5 text-emerald-400" />
            </div>
            <h3 class="mt-5 text-xl font-black text-white">{{ t('Conversion Scoring') }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ t('Beyond SEO and AEO. We score clarity, trust, and conversion intent — what makes real visitors and AI engines choose your page.') }}</p>
          </div>

          <!-- Kanban Board -->
          <div class="rounded-3xl border border-white/10 bg-black/25 p-7 backdrop-blur-sm">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <UIcon name="i-lucide-kanban" class="h-5 w-5 text-emerald-400" />
            </div>
            <h3 class="mt-5 text-xl font-black text-white">{{ t('Kanban Issue Board') }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ t('Every issue is a card. Drag to prioritize, assign status, and track fixes from detection to verified.') }}</p>
          </div>

          <!-- Project Brain -->
          <div class="rounded-3xl border border-white/10 bg-black/25 p-7 backdrop-blur-sm">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <UIcon name="i-lucide-brain" class="h-5 w-5 text-emerald-400" />
            </div>
            <h3 class="mt-5 text-xl font-black text-white">{{ t('Project Brain') }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ t('Learns across audits. Tracks patterns, detects regressions, narrates your improvement story over time.') }}</p>
          </div>

          <!-- 5-Second Test -->
          <div class="rounded-3xl border border-white/10 bg-black/25 p-7 backdrop-blur-sm">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <UIcon name="i-lucide-eye" class="h-5 w-5 text-emerald-400" />
            </div>
            <h3 class="mt-5 text-xl font-black text-white">{{ t('5-Second Test') }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ t('What does a stranger see in 5 seconds? AI visual analysis reveals the exact first impression your page makes.') }}</p>
          </div>

          <!-- Re-audit & Verify -->
          <div class="rounded-3xl border border-white/10 bg-black/25 p-7 backdrop-blur-sm">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <UIcon name="i-lucide-repeat" class="h-5 w-5 text-emerald-400" />
            </div>
            <h3 class="mt-5 text-xl font-black text-white">{{ t('Re-audit & Verify') }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ t('Fixed an issue? Run another audit. PawByTech automatically verifies fixes and catches regressions.') }}</p>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const tickerItems = computed(() => [
  { id: 1, icon: 'i-lucide-users', text: t('7 AI Persona Agents') },
  { id: 2, icon: 'i-lucide-target', text: t('6 Score Dimensions') },
  { id: 3, icon: 'i-lucide-zap', text: t('Results in under 3 minutes') },
  { id: 4, icon: 'i-lucide-kanban', text: t('Kanban Issue Board') },
  { id: 5, icon: 'i-lucide-brain', text: t('AI-Powered Insights') },
  { id: 6, icon: 'i-lucide-repeat', text: t('Regression Detection') },
  { id: 7, icon: 'i-lucide-shield-check', text: t('Trust Score Analysis') },
  { id: 8, icon: 'i-lucide-eye', text: t('5-Second First Impression') },
])

const personaTags = computed(() => [
  t('The Skeptic'),
  t('Impulse Visitor'),
  t('Comparison Shopper'),
  t('Value Seeker'),
  t('Mobile User'),
  t('First-Time Visitor'),
  t('Power User'),
])
</script>
