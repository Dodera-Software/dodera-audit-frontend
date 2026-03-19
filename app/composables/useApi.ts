export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function $api<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${path}`, {
        ...options,
        headers,
      })
    }
    catch (error: any) {
      if (error?.response?.status === 401) {
        authStore.logout()
        const route = useRoute()
        navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      }
      throw error
    }
  }

  return { $api }
}
