<template>
  <section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20">

    <!-- Background orbs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[150px]" />
      <div class="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px]" />
      <div class="absolute right-1/4 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[110px]" />
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>

    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-5xl text-center">
      <!-- Badge -->
      <div class="mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-5 py-2 shadow-[0_0_40px_rgba(16,185,129,0.12)] backdrop-blur">
        <span class="flex h-2 w-2 items-center justify-center">
          <span class="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/60" />
          <span class="h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span class="text-sm font-semibold text-emerald-400">{{ t('AI-Powered · AI Persona Agents · Fast results') }}</span>
      </div>

      <!-- Headline -->
      <h1 class="text-5xl font-black leading-[1.0] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[88px]">
        {{ t('Get a full') }}
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          {{ t('AI audit') }}
        </span><br class="hidden sm:block" />
        {{ t('of your website.') }}
      </h1>

      <!-- Subtitle -->
      <p class="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
        {{ t('Paste any URL. Our AI personas browse your page') }}
        <span class="italic text-zinc-300">{{ t('like real visitors would') }}</span>
        {{ t('and tell you exactly why people leave and what to fix. Score your page with confidence for clarity, trust and conversion.') }}
      </p>

      <!-- CTA button -->
      <div class="mt-10 flex justify-center">
        <LandingAuditButton :label="t('Audit for free')" />
      </div>

      <!-- Trust micro-copy -->
      <div class="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-300">
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-check-circle" class="h-4 w-4 shrink-0 text-emerald-500" />
          {{ t('No credit card') }}
        </span>
        <span class="hidden h-3 w-px bg-white/15 sm:block" />
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-check-circle" class="h-4 w-4 shrink-0 text-emerald-500" />
            {{ t('No code changes') }}
          </span>
          <span class="hidden h-3 w-px bg-white/15 sm:block" />
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-check-circle" class="h-4 w-4 shrink-0 text-emerald-500" />
          {{ t('Free plan') }}
        </span>
      </div>
    </div>

    <!-- Scroll hint -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <UIcon name="i-lucide-chevrons-down" class="h-6 w-6 text-zinc-400" />
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
