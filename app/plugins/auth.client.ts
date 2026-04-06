export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const token = useAuthToken()
  const authStore = useAuthStore()

  if (token.value && !authStore.user) {
    try {
      const data = await $fetch<{ data: any }>(`${config.public.apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' },
      })
      authStore.setUser(data.data)
    }
    catch {
      token.value = null
      authStore.clearUser()
      // Hard redirect to avoid hydration mismatch — the server rendered
      // an authenticated layout but the token is invalid. A full reload
      // lets the server re-render with the correct (guest) layout.
      window.location.href = '/login'
    }
  }
})
