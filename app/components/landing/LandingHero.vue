<template>
  <section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-28">

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
        <span class="text-sm font-semibold text-emerald-400">{{ t('AI-Powered · 7 Persona Agents · Results in <3 min') }}</span>
      </div>

      <!-- Headline -->
      <h1 class="text-5xl font-black leading-[1.0] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[88px]">
        {{ t('Your page is') }} <br class="hidden sm:block" />
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          {{ t('not optimized.') }}
        </span><br />
        {{ t('We show you why.') }}
      </h1>

      <!-- Subtitle -->
      <p class="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
        {{ t('Drop any URL. Seven AI personas audit your page for clarity, trust, and conversion —') }}
        {{ t('and hand you a') }} <span class="font-semibold text-zinc-200">{{ t('ranked fix list with exact steps') }}</span>.
      </p>

      <!-- CTA form -->
      <div class="mx-auto mt-10 flex max-w-xl items-stretch overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-1.5 shadow-[0_0_80px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_60px_rgba(16,185,129,0.15)]">
        <div class="flex flex-1 items-center gap-3 px-4">
          <UIcon name="i-lucide-link" class="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            type="url"
            :placeholder="t('https://yourwebsite.com')"
            class="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
        <NuxtLink
          to="/register"
          class="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_60px_rgba(16,185,129,0.7)] active:scale-95"
        >
          {{ t('Audit for free') }}
          <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <!-- Trust micro-copy -->
      <div class="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-check-circle" class="h-4 w-4 shrink-0 text-emerald-500" />
          {{ t('No credit card') }}
        </span>
        <span class="hidden h-3 w-px bg-white/15 sm:block" />
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-check-circle" class="h-4 w-4 shrink-0 text-emerald-500" />
            {{ t('No code changes needed') }}
          </span>
          <span class="hidden h-3 w-px bg-white/15 sm:block" />
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-check-circle" class="h-4 w-4 shrink-0 text-emerald-500" />
          {{ t('Free during beta') }}
        </span>
      </div>
    </div>

    <!-- Scroll hint -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <UIcon name="i-lucide-chevrons-down" class="h-6 w-6 text-zinc-600" />
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
