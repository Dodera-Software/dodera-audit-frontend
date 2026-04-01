<template>
  <section class="relative overflow-hidden px-6 py-40">
    <!-- Background -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-zinc-800 to-zinc-800" />
      <div class="absolute -bottom-40 -left-40 h-[700px] w-[700px] rounded-full bg-emerald-600/15 blur-[160px]" />
      <div class="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-teal-600/10 blur-[130px]" />
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-4xl text-center">
      <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <ClientOnly>
          <Vue3Lottie animationLink="/animations/success.json" :height="22" :width="22" />
        </ClientOnly>
        <span class="text-sm font-semibold text-emerald-400">{{ t('Free during beta — no card required') }}</span>
      </div>

      <h2 class="text-5xl font-black leading-[1.0] tracking-tight text-white sm:text-6xl md:text-7xl">
        {{ t('Stop guessing.') }}<br />
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          {{ t('Start converting.') }}
        </span>
      </h2>

      <p class="mx-auto mt-7 max-w-xl text-xl text-zinc-400">
        {{ t('Paste your URL and get a full AI audit in under 3 minutes. No setup. No code. No credit card.') }}
      </p>

      <div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <NuxtLink
          to="/register"
          class="group relative inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-10 py-5 text-lg font-black text-black shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_100px_rgba(16,185,129,0.8)] active:scale-100"
        >
          {{ t("Audit my page — it's free") }}
          <UIcon name="i-lucide-arrow-right" class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </NuxtLink>
        <NuxtLink
          to="/pricing"
          class="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-8 py-5 text-base font-medium text-zinc-200 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/15 hover:text-white"
        >
          {{ t('View pricing') }}
        </NuxtLink>
      </div>

      <p class="mt-6 text-sm text-zinc-600">{{ t('Results in under 3 minutes. Cancel anytime.') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

const { t } = useI18n()
</script>
