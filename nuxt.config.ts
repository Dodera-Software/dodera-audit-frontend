// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'AI Website Audit Tool for Clarity, Trust & Conversion | PawByTech',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'description', content: 'Get AI-powered website audits with 7+ AI personas. Analyze clarity, trust, conversion potential & UX. Fix issues faster with Kanban boards. Free audit, no credit card needed.' },
        { name: 'keywords', content: 'website audit tool, AI audit, conversion optimization, UX audit, CRO tool, web analysis, AI personas' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'AI Website Audit Tool for Clarity, Trust & Conversion | PawByTech' },
        { property: 'og:description', content: 'Get AI-powered website audits with 7+ AI personas. Analyze clarity, trust, conversion potential & UX. Fix issues faster with Kanban boards.' },
        { property: 'og:url', content: 'https://pawbytech.com' },
        { property: 'og:image', content: 'https://pawbytech.com/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'AI Website Audit Tool for Clarity, Trust & Conversion | PawByTech' },
        { name: 'twitter:description', content: 'Get AI-powered website audits with 7+ AI personas. Analyze clarity, trust, conversion potential & UX. Fix issues faster with Kanban boards.' },
        { name: 'twitter:image', content: 'https://pawbytech.com/og-image.png' },
        { name: 'theme-color', content: '#10b981' },
      ],
      link: [
        { rel: 'canonical', href: 'https://pawbytech.com' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-charts',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: '',
      reverbKey: '',
      reverbHost: '',
      reverbPort: 0,
      reverbScheme: 'ws',
    },
  },

  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
  },

  googleFonts: {
    families: {
      'Inter': [400, 500, 600, 700],
    },
    display: 'swap',
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'zod',
        'vue3-lottie',
        'date-fns',
        'date-fns/locale',
        'pusher-js',
        'driver.js',
        'ag-grid-vue3',
        'ag-grid-community',
      ],
    },
  }
})
