<template>
  <footer class="border-t border-white/10 px-6 py-16">
    <div class="mx-auto max-w-7xl">
      <div class="grid grid-cols-2 gap-12 md:grid-cols-3">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <img src="~/assets/logo/pawbytech-logo.png" alt="PawByTech" class="h-8 w-auto" />
            <span class="font-bold text-white">PawByTech</span>
          </NuxtLink>
          <p class="mt-4 text-sm leading-relaxed text-zinc-500">
            {{ t('AI-powered website audit platform by') }}
            <a href="https://doderasoft.com" target="_blank" rel="noopener" class="text-zinc-400 transition-colors hover:text-white">Dodera Software</a>.
          </p>
          <div class="mt-6 flex gap-3">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-black/20 text-zinc-400 transition-all backdrop-blur-sm hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              <UIcon :name="social.icon" class="h-4 w-4" />
            </a>
          </div>
        </div>

        <!-- Link columns -->
        <div v-for="col in footerLinks" :key="col.heading">
          <h4 class="mb-4 text-sm font-semibold text-zinc-300">{{ col.heading }}</h4>
          <ul class="space-y-3">
            <li v-for="link in col.links" :key="link.label">
              <NuxtLink :to="link.to" class="text-sm text-zinc-500 transition-colors hover:text-white">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

      </div>

      <div class="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
        <p class="text-sm text-zinc-400">© {{ currentYear }} {{ t('Dodera Software. All rights reserved.') }}</p>
        <p class="text-xs text-zinc-500">
          {{ t('Made with') }} <span class="inline-block animate-pulse">❤️</span> {{ t('by') }}
          <a href="https://www.doderasoft.com/" target="_blank" rel="noopener" class="text-zinc-400 transition-colors hover:text-white">Dodera Software</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()

const currentYear = computed(() => new Date().getFullYear())

const socials = useLandingSocials()

interface FooterLink {
  label: string
  to: string
}

interface FooterColumn {
  heading: string
  links: FooterLink[]
}

const footerLinks = computed<FooterColumn[]>(() => [
  {
    heading: t('Product'),
    links: [
      { label: t('Features'), to: '#features' },
      { label: t('Pricing'), to: '#pricing' },
    ],
  },
  {
    heading: t('Legal'),
    links: [
      { label: t('Privacy Policy'), to: '#' },
      { label: t('Terms of Service'), to: '#' },
      { label: t('Cookie Policy'), to: '#' },
    ],
  },
])
</script>
