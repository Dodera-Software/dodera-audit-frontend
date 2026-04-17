<template>
  <section id="how-it-works" class="px-6 py-28">
    <div class="mx-auto max-w-5xl">
      <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white">{{ t('Process') }}</p>
      <h2 class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl">
        {{ t('Audit in') }}
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{{ t('3 steps') }}</span>
      </h2>
      <p class="mx-auto mb-20 max-w-lg text-center text-lg text-zinc-400">
        {{ t('No integration. No code changes. Just an URL.') }}
      </p>

      <div class="relative flex flex-col gap-16 md:flex-row md:gap-0">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="group relative z-10 flex flex-1 flex-col items-center text-center"
        >
          <!-- Connector line (between steps, not after last) -->
          <div
            v-if="i < steps.length - 1"
            class="pointer-events-none absolute top-8 left-[calc(50%+2.5rem)] hidden h-px md:block"
            :style="{ width: 'calc(100% - 5rem)' }"
          >
            <div class="h-full w-full bg-gradient-to-r from-emerald-500/30 via-emerald-500/15 to-emerald-500/30" />
            <div class="absolute inset-0 h-full w-0 bg-gradient-to-r from-emerald-400/80 via-emerald-400/50 to-emerald-400/80 transition-all duration-700 group-hover:w-full" />
          </div>

          <!-- Icon -->
          <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/12 bg-black/30 shadow-lg shadow-black/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <UIcon :name="step.icon" class="h-7 w-7 text-emerald-400 transition-transform duration-500 group-hover:scale-110" />
          </div>

          <!-- Text -->
          <h3 class="mt-5 text-xl font-black text-white transition-colors duration-300 group-hover:text-emerald-300">{{ step.title }}</h3>
          <p class="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">{{ step.description }}</p>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-16 flex flex-col items-center gap-3">
        <LandingAuditButton :label="t('Audit for free')" />
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const steps = computed(() => [
  {
    icon: 'i-lucide-link',
    title: t('Paste your URL'),
    description: t('Drop in any web page — landing page, product page, services. No payments required to start.'),
  },
  {
    icon: 'i-lucide-cpu',
    title: t('AI analyses your page'),
    description: t('Each AI persona reads, critiques, and scores your page from a distinct visitor mindset. Done in minutes.'),
  },
  {
    icon: 'i-lucide-clipboard-list',
    title: t('Get your action plan'),
    description: t('Prioritized issues, a Kanban board, and a narrative report that tells you exactly what and how to fix.'),
  },
])
</script>
