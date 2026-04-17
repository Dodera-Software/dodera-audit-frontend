<template>
  <section class="px-6 py-28">
    <div class="mx-auto max-w-5xl">
      <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-white">{{ t('Why PawByTech') }}</p>
      <h2 class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl">
        {{ t('Better than') }}<br />
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{{ t('analytics alone.') }}</span>
      </h2>
      <p class="mx-auto mb-16 max-w-xl text-center text-lg text-zinc-300">
        {{ t('Analytics tells you what happened. PawByTech tells you why — and exactly what to fix.') }}
      </p>

      <div class="overflow-x-auto rounded-3xl border border-white/10">
        <!-- Header -->
        <div class="grid min-w-[560px] grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-white/10 bg-black/30">
          <div class="p-5" />
          <div class="border-l border-white/8 p-5 text-center">
            <p class="text-xs font-semibold uppercase tracking-widest text-zinc-500">{{ t('Analytics & heatmaps') }}</p>
          </div>
          <div class="border-l border-white/8 p-5 text-center">
            <p class="text-xs font-semibold uppercase tracking-widest text-zinc-500">{{ t('Human UX audit') }}</p>
          </div>
          <div class="border-l border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
            <p class="text-xs font-bold uppercase tracking-widest text-emerald-400">PawByTech</p>
          </div>
        </div>

        <!-- Rows -->
        <div
          v-for="(row, i) in rows"
          :key="i"
          class="grid min-w-[560px] grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-white/8 last:border-0"
          :class="i % 2 === 0 ? 'bg-black/15' : 'bg-black/25'"
        >
          <div class="flex items-center p-5">
            <p class="text-sm font-semibold text-white">{{ row.label }}</p>
          </div>
          <div class="flex items-center justify-center border-l border-white/8 p-5 text-center text-sm text-zinc-400">
            {{ row.analytics }}
          </div>
          <div class="flex items-center justify-center border-l border-white/8 p-5 text-center text-sm text-zinc-400">
            {{ row.human }}
          </div>
          <div class="flex items-center justify-center border-l border-emerald-500/30 bg-emerald-500/5 p-5 text-center text-sm font-semibold text-emerald-300">
            {{ row.pbt }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface ComparisonRow {
  label: string
  analytics: string
  human: string
  pbt: string
}

const rows = computed<ComparisonRow[]>(() => [
  {
    label: t('Time to insight'),
    analytics: t('Days or weeks of data'),
    human: t('3–10 business days'),
    pbt: t('Under 3 minutes'),
  },
  {
    label: t('What you learn'),
    analytics: t('Traffic and click data'),
    human: t('Expert opinion'),
    pbt: t('Why visitors hesitate'),
  },
  {
    label: t('Next steps'),
    analytics: t('You figure it out'),
    human: t('PDF report to act on'),
    pbt: t('Kanban board, fix & verify'),
  },
  {
    label: t('Re-check after fixes'),
    analytics: t('Wait for new traffic'),
    human: t('Hire them again'),
    pbt: t('Re-audit in one click'),
  },
  {
    label: t('Cost to start'),
    analytics: t('Tool fees + your time'),
    human: t('Hundreds or more'),
    pbt: t('Free'),
  },
])
</script>
