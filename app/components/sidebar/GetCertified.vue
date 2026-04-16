<template>
  <!-- Trigger button -->
  <button
    type="button"
    class="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2.5 text-left transition-all hover:border-amber-300 hover:shadow-sm dark:border-amber-800/30 dark:from-amber-950/30 dark:to-yellow-950/20 dark:hover:border-amber-700/50"
    :aria-label="t('Get Certified')"
    @click="open = true"
  >
    <img
      src="~/assets/logo/pawbytech-certified.png"
      :alt="t('PawByTech Certified')"
      class="h-9 w-9 shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
    />
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold text-amber-900 dark:text-amber-200">
        {{ t('Get Certified') }}
      </p>
      <p class="text-[11px] text-amber-700/70 dark:text-amber-400/60">
        {{ t('Score 80+ to earn the badge') }}
      </p>
    </div>
    <UIcon name="i-lucide-chevron-right" class="ml-auto h-4 w-4 shrink-0 text-amber-400 dark:text-amber-600" />
  </button>

  <!-- Slideover panel -->
  <BaseSlideover v-model:open="open">
    <template #title>
      <div class="flex items-center gap-2.5">
        <img
          src="~/assets/logo/pawbytech-certified.png"
          :alt="t('PawByTech Certified')"
          class="h-7 w-7"
        />
        <span>{{ t('PawByTech Certified') }}</span>
      </div>
    </template>

    <!-- Stamp hero -->
    <div class="mb-6 flex flex-col items-center rounded-2xl bg-gradient-to-b from-amber-50 to-yellow-50/50 px-6 py-8 text-center dark:from-amber-950/30 dark:to-yellow-950/10">
      <img
        src="~/assets/logo/pawbytech-certified.png"
        :alt="t('PawByTech Certified')"
        class="h-28 w-28 drop-shadow-md"
      />
      <h3 class="mt-4 text-lg font-bold text-amber-900 dark:text-amber-200">
        {{ t('PawByTech Certified') }}
      </h3>
      <p class="mt-1 text-xs font-medium uppercase tracking-widest text-amber-600/70 dark:text-amber-500/60">
        {{ t('Premium Compliance & Performance') }}
      </p>
    </div>

    <!-- What is it -->
    <section class="mb-6">
      <h4 class="mb-2 text-sm font-semibold text-(--ui-text-highlighted)">
        {{ t('What is PawByTech Certified?') }}
      </h4>
      <p class="text-sm leading-relaxed text-(--ui-text-muted)">
        {{ t('PawByTech Certified is a quality mark awarded to pages that score 80 or above on our AI audit. It signals to visitors — and to you — that your page meets a high standard for clarity, trust, conversion, and performance.') }}
      </p>
    </section>

    <!-- What it means checklist -->
    <section class="mb-6">
      <h4 class="mb-3 text-sm font-semibold text-(--ui-text-highlighted)">
        {{ t('What it means') }}
      </h4>
      <ul class="space-y-2">
        <li
          v-for="benefit in benefits"
          :key="benefit"
          class="flex items-start gap-2.5"
        >
          <UIcon name="i-lucide-check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span class="text-sm text-(--ui-text-muted)">{{ benefit }}</span>
        </li>
      </ul>
    </section>

    <!-- How to get it -->
    <section class="mb-6">
      <h4 class="mb-3 text-sm font-semibold text-(--ui-text-highlighted)">
        {{ t('How to get it') }}
      </h4>
      <div class="space-y-2">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="flex items-center gap-3 rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated) px-3.5 py-2.5"
        >
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            {{ i + 1 }}
          </div>
          <span class="text-sm text-(--ui-text-muted)">{{ step }}</span>
        </div>
      </div>
    </section>

  </BaseSlideover>
</template>

<script setup lang="ts">
const { t } = useI18n()

const open = ref(false)

const benefits = computed(() => [
  t('Strong clarity — visitors understand your message instantly'),
  t('High trust signals — your page earns visitor confidence'),
  t('Optimised for conversion — your CTAs and flow work'),
  t('Solid technical & performance foundation'),
])

const steps = computed(() => [
  t('Score 80+ on any audit'),
  t('Earn the certified badge'),
  t('Download & share it'),
  t('Keep improving'),
])
</script>
