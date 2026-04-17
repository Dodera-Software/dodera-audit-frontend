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
        <UiLottie src="/animations/success.json" :height="22" :width="22" />
        <span class="text-sm font-semibold text-emerald-400">{{ t('Sign up for free — no card required') }}</span>
      </div>

      <h2 class="text-5xl font-black leading-[1.0] tracking-tight text-white sm:text-6xl md:text-7xl">
        {{ t('Your next audit is') }}<br />
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          {{ t('one URL away.') }}
        </span>
      </h2>

      <p class="mx-auto mt-7 max-w-xl text-xl text-zinc-300">
        {{ t('Paste your URL and get a full AI audit in under 3 minutes.') }}
      </p>

      <div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <LandingAuditButton :label="auditButtonLabel" />
        <a
          href="#pricing"
          class="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-8 py-5 text-base font-medium text-zinc-200 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/15 hover:text-white"
        >
          {{ t('View pricing') }}
        </a>
      </div>

      <p class="mt-6 text-sm text-zinc-400">{{ t('Results in under 3 minutes. Cancel anytime.') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const auditButtonLabel = computed(() => t('Audit for free'))
</script>
