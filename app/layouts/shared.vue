<template>
  <div class="min-h-screen bg-(--ui-bg)">
    <!-- Sticky header -->
    <header class="sticky top-0 z-50 border-b border-(--ui-border) bg-(--ui-bg)/80 backdrop-blur-lg">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div class="flex items-center gap-3">
          <AppLogo class="h-7 w-auto" />
          <div class="hidden items-center gap-2 sm:flex">
            <div class="h-4 w-px bg-(--ui-border)" />
            <span class="text-xs font-medium text-(--ui-text-dimmed)">{{ t('Shared Report') }}</span>
          </div>
        </div>
        <UButton to="/register" color="primary" size="sm" icon="i-lucide-arrow-right" trailing>
          {{ t('Try PawByTech Free') }}
        </UButton>
      </div>
    </header>

    <!-- Content -->
    <main>
      <slot />
    </main>

    <!-- Footer CTA -->
    <footer class="relative overflow-hidden border-t border-(--ui-border)">
      <div class="absolute inset-0 bg-gradient-to-b from-(--ui-primary)/5 to-(--ui-primary)/10" />
      <div class="relative mx-auto max-w-7xl px-6 py-16 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--ui-primary)/10">
          <UIcon name="i-lucide-sparkles" class="h-7 w-7 text-(--ui-primary)" />
        </div>
        <h3 class="mt-5 text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Want audit reports like this for your website?') }}</h3>
        <p class="mx-auto mt-3 max-w-lg text-(--ui-text-muted)">
          {{ t('PawByTech uses AI to analyze your website across clarity, trust, conversion, SEO, performance, and accessibility. Get actionable insights in minutes.') }}
        </p>
        <div class="mt-7 flex items-center justify-center gap-3">
          <UButton to="/register" size="xl" icon="i-lucide-sparkles">
            {{ t('Start free audit') }}
          </UButton>
          <UButton to="/pricing" variant="outline" color="neutral" size="xl">
            {{ t('View pricing') }}
          </UButton>
        </div>
        <p class="mt-5 text-xs text-(--ui-text-dimmed)">{{ t('No credit card required. Free plan includes 1 audit per month.') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
