<template>
  <header class="fixed top-0 z-50 w-full border-b border-white/8 bg-zinc-800/80 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <img src="~/assets/logo/pawbytech-logo.png" alt="PawByTech" class="h-8 w-auto" />
        <span class="text-lg font-bold tracking-tight text-white">PawByTech</span>
      </NuxtLink>

      <nav class="hidden items-center gap-8 md:flex">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <NuxtLink to="/login" class="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white md:block">
          {{ t('Sign in') }}
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 hover:shadow-[0_0_24px_rgba(16,185,129,0.3)]"
        >
          {{ t('Get started free') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()

const navLinks = computed(() => [
  { label: t('How it works'), href: '#how-it-works' },
  { label: t('Features'), href: '#features' },
  { label: t('Pricing'), href: '#pricing' },
])
</script>
