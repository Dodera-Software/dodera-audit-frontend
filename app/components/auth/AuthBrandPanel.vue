<template>
  <div class="relative hidden flex-col overflow-hidden bg-zinc-800 text-white selection:bg-emerald-500/30 lg:flex lg:w-1/2">
    <!-- Ambient glow orbs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
      <div class="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
      <div class="absolute right-1/4 top-1/3 h-56 w-56 rounded-full bg-violet-600/10 blur-[90px]" />
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>

    <!-- Content -->
    <div class="relative z-10 flex h-full flex-col p-8">
      <!-- Logo + wordmark -->
      <div class="flex items-center gap-2.5">
        <img src="~/assets/logo/pawbytech-logo.png" alt="" class="h-8 w-auto" />
        <span class="text-lg font-bold tracking-tight text-white">PawByTech</span>
      </div>

      <!-- Centre -->
      <div class="flex flex-1 flex-col items-center justify-center">
        <div class="relative">
          <div class="absolute inset-0 m-auto h-40 w-40 rounded-full bg-emerald-500/15 blur-2xl" />
          <ClientOnly>
            <Vue3Lottie
              animation-link="/animations/animation-bot.json"
              :height="190"
              :width="190"
              :loop="true"
              :auto-play="true"
              class="relative drop-shadow-2xl"
            />
            <template #fallback>
              <div class="h-[190px] w-[190px]" />
            </template>
          </ClientOnly>
        </div>

        <h1 class="mt-3 text-center text-4xl font-bold leading-tight tracking-tight text-white">
          {{ t('Audit smarter.') }}<br />
          <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {{ t('Convert better.') }}
          </span>
        </h1>

        <p class="mt-3 max-w-xs text-center text-sm leading-relaxed text-zinc-400">
          {{ t('AI-powered website audits that turn UX insights into measurable results.') }}
        </p>

        <!-- Feature pills -->
        <div class="mt-6 flex w-full max-w-xs flex-col gap-2.5">
          <div
            v-for="feature in features"
            :key="feature.text"
            class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 backdrop-blur-sm"
          >
            <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
              <UIcon :name="feature.icon" class="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span class="text-sm text-zinc-300">{{ feature.text }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-zinc-600">
        © {{ currentYear }} PawByTech · {{ t('All rights reserved.') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

const { t } = useI18n()
const currentYear = new Date().getFullYear()

const features = computed(() => [
  { icon: 'i-lucide-search', text: t('Drop a URL — your AI audit is ready in under 3 minutes') },
  { icon: 'i-lucide-list-checks', text: t('Get a ranked fix list with exact steps to improve conversions') },
  { icon: 'i-lucide-trending-up', text: t('Track your score week over week and prove ROI') },
])
</script>
