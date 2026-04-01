<template>
  <section id="how-it-works" class="px-6 py-28">
    <div class="mx-auto max-w-5xl">
      <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-emerald-500">{{ t('Process') }}</p>
      <h2 class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl">
        {{ t('Audit in') }}
        <span class="text-emerald-400">{{ t('3 steps') }}</span>
      </h2>
      <p class="mx-auto mb-20 max-w-lg text-center text-lg text-zinc-400">
        {{ t('No integration. No code changes. Just a URL.') }}
      </p>

      <div class="relative flex flex-col gap-12 md:flex-row md:gap-6">
        <!-- Connector line -->
        <div class="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent md:block md:left-1/2" />

        <div
          v-for="(step, i) in steps"
          :key="i"
          class="relative z-10 flex flex-1 flex-col items-center text-center"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/12 bg-black/30 shadow-lg shadow-black/30 backdrop-blur-sm">
            <UIcon :name="step.icon" class="h-7 w-7 text-emerald-400" />
          </div>
          <div class="mt-2 h-7 w-7 rounded-full bg-emerald-500/10 text-center text-xs font-bold leading-7 text-emerald-400 ring-1 ring-emerald-500/30">
            {{ i + 1 }}
          </div>
          <h3 class="mt-4 text-xl font-black text-white">{{ step.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ step.description }}</p>
        </div>
      </div>

      <div class="mt-24 flex justify-center">
        <ClientOnly>
          <Vue3Lottie animationLink="/animations/RocketLP.json" :height="180" :width="180" />
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

const { t } = useI18n()

const steps = computed(() => [
  {
    icon: 'i-lucide-link',
    title: t('Paste your URL'),
    description: t('Drop in any live page — landing page, product page, checkout — no account setup required to start.'),
  },
  {
    icon: 'i-lucide-cpu',
    title: t('7 AIs go to work'),
    description: t('Each AI persona reads, critiques, and scores your page from a distinct visitor mindset. Done in minutes.'),
  },
  {
    icon: 'i-lucide-clipboard-list',
    title: t('Get your action plan'),
    description: t('Prioritized issues, a Kanban board, and a narrative report that tells you exactly what to fix and why.'),
  },
])
</script>
