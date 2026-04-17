<template>
  <section id="preview" class="relative overflow-hidden px-6 py-28">
    <!-- Background glow -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-[160px]" />
    </div>

    <div class="relative mx-auto max-w-6xl">
      <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white">{{ t('Sample report') }}</p>
      <h2 class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl">
        {{ t('This is') }}
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{{ t('what you get.') }}</span>
      </h2>
      <p class="mx-auto mb-16 max-w-xl text-center text-lg text-zinc-400">
        {{ t('Real output from an audit of a web page. Every audit includes scores, persona verdicts, annotated issues, and a full action plan.') }}
      </p>

      <!-- Browser frame -->
      <div class="overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <!-- Chrome bar -->
        <div class="flex items-center gap-3 border-b border-white/8 bg-zinc-950/80 px-5 py-3">
          <div class="flex gap-1.5">
            <div class="h-3 w-3 rounded-full bg-red-500/70" />
            <div class="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div class="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <div class="flex flex-1 items-center gap-2 rounded-lg bg-zinc-800/80 px-3 py-1.5">
            <UIcon name="i-lucide-lock" class="h-3 w-3 shrink-0 text-zinc-500" />
            <span class="text-xs text-zinc-400">app.pawbytech.com / my-website / homepage / audit</span>
          </div>
        </div>

        <LandingReportMockup />
      </div>

      <p class="mt-5 text-center text-sm text-zinc-600">
        {{ t('Sample data only. Scroll to explore the full report.') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
