<template>
  <section
    id="certification"
    aria-labelledby="certification-heading"
    class="relative overflow-hidden px-6 py-28"
  >
    <!-- Ambient amber glow -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="h-96 w-96 rounded-full bg-amber-500/6 blur-3xl" />
    </div>

    <div class="relative mx-auto max-w-7xl">
      <!-- Section header -->
      <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white">
        {{ t('Quality Mark') }}
      </p>
      <h2
        id="certification-heading"
        class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl"
      >
        {{ t('Earn the') }}<br />
        <span class="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
          {{ t('PawByTech Certified') }}
        </span>
        {{ t(' badge') }}
      </h2>
      <p class="mx-auto mb-16 max-w-xl text-center text-lg text-zinc-400">
        {{ t('Score 80 or above on any audit and earn the quality mark that signals your page meets a high standard for clarity, trust, conversion, and performance.') }}
      </p>

      <!-- Main content -->
      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

        <!-- Left: badge showcase -->
        <div class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/8 to-black/20 p-10 text-center backdrop-blur-sm">
          <!-- Shimmer strip -->
          <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <div class="flex flex-col items-center">
            <UiCertifiedBadgeIcon class="h-40 w-40 drop-shadow-2xl" />
            <h3 class="mt-6 text-2xl font-black text-white">
              {{ t('PawByTech Certified') }}
            </h3>
            <p class="mt-1 text-xs font-semibold uppercase tracking-widest text-amber-400/80">
              {{ t('Premium Compliance & Performance') }}
            </p>
            <p class="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
              {{ t('A quality mark awarded to pages that score 80 or above on our AI audit. It signals to visitors — and to you — that your page meets a high standard.') }}
            </p>
          </div>

          <!-- How to get it -->
          <div class="mt-8 space-y-2 text-left">
            <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {{ t('How to get it') }}
            </p>
            <div
              v-for="(step, i) in steps"
              :key="i"
              class="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3"
            >
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                {{ i + 1 }}
              </div>
              <span class="text-sm text-zinc-300">{{ step }}</span>
            </div>
          </div>
        </div>

        <!-- Right: what it means -->
        <div class="space-y-4">
          <h3 class="mb-6 text-2xl font-black text-white">
            {{ t('What it means for your page') }}
          </h3>
          <article
            v-for="benefit in benefits"
            :key="benefit.title"
            class="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/25 p-5 backdrop-blur-sm"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/25">
              <UIcon :name="benefit.icon" class="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p class="font-semibold text-white">{{ benefit.title }}</p>
              <p class="mt-1 text-sm leading-relaxed text-zinc-400">{{ benefit.description }}</p>
            </div>
          </article>

          <!-- Score pill callout -->
          <div class="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/6 px-5 py-4">
            <UIcon name="i-lucide-star" class="h-5 w-5 shrink-0 text-amber-400" />
            <p class="text-sm text-zinc-300">
              <span class="font-semibold text-amber-300">{{ t('Score 80+') }}</span>
              {{ t(' on any audit to instantly earn the badge — no application required.') }}
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const benefits = computed(() => [
  {
    icon: 'i-lucide-message-circle',
    title: t('Strong clarity'),
    description: t('Visitors understand your message instantly. No ambiguity, no guessing — your value is crystal clear.'),
  },
  {
    icon: 'i-lucide-shield-check',
    title: t('High trust signals'),
    description: t('Your page earns visitor confidence with the signals that turn browsers into buyers.'),
  },
  {
    icon: 'i-lucide-mouse-pointer-click',
    title: t('Optimised for conversion'),
    description: t('Your CTAs, flow, and value proposition work together cohesively to drive action.'),
  },
  {
    icon: 'i-lucide-zap',
    title: t('Solid technical foundation'),
    description: t('Fast, reliable, and technically sound — a page that performs and scales.'),
  },
])

const steps = computed(() => [
  t('Score 80+ on any audit'),
  t('Earn the certified badge automatically'),
  t('Download & share your certificate'),
])
</script>
