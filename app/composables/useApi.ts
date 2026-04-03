export function useApi() {
  const config = useRuntimeConfig()
  const token = useAuthToken()
  const authStore = useAuthStore()
  const nuxtApp = useNuxtApp()

  async function $api<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${path}`, {
        ...options,
        headers,
      })
    }
    catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err?.response?.status === 401) {
        token.value = null
        authStore.clearUser()
        await nuxtApp.runWithContext(() => {
          const route = useRoute()
          return navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
        })
      }
      throw error
    }
  }

  return { $api }
}
