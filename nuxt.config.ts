// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    },
  },

  googleFonts: {
    families: {
      Syne: [400, 500, 600, 700, 800],
      'DM Sans': [400, 500, 600, 700],
      'DM Mono': [400, 500],
    },
    display: 'swap',
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
  },
})
