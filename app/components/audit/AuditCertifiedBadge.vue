<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 dark:border-amber-800/40 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30"
  >
    <!-- Decorative shimmer strip -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

    <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <!-- Stamp -->
      <div class="shrink-0">
        <UiCertifiedBadgeIcon class="h-32 w-32 drop-shadow-md" />
      </div>

      <!-- Content -->
      <div class="flex-1 text-center sm:text-left">
        <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <UBadge color="warning" variant="subtle" size="sm" icon="i-lucide-award">
            {{ t('PawByTech Certified') }}
          </UBadge>
          <UBadge color="success" variant="subtle" size="sm">
            {{ t('Score 80+') }}
          </UBadge>
        </div>

        <h3 class="mt-3 text-xl font-bold text-amber-900 dark:text-amber-200">
          {{ t('Your page is certified!') }}
        </h3>

        <p class="mt-1.5 max-w-md text-sm text-amber-800/80 dark:text-amber-300/70">
          {{ t('This page scored {score}/100 — above the 80-point certification threshold.', { score: props.score }) }}
        </p>

        <p class="mt-1 text-xs text-amber-700/60 dark:text-amber-400/50">
          {{ t('Premium Compliance & Performance') }}
        </p>

        <!-- Score pill -->
        <div class="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <div class="flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/60 px-4 py-1.5 dark:border-amber-700/40 dark:bg-amber-950/40">
            <UIcon name="i-lucide-star" class="h-4 w-4 text-amber-500" />
            <span class="text-sm font-semibold tabular-nums text-amber-900 dark:text-amber-200">
              {{ props.score }}<span class="text-xs font-normal text-amber-700/60 dark:text-amber-400/50">/100</span>
            </span>
            <span class="text-xs text-amber-700/60 dark:text-amber-400/50">{{ t('Certified score') }}</span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  score: number
  pageUrl?: string
}

const props = defineProps<Props>()
const { t } = useI18n()


</script>
