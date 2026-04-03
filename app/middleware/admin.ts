export default defineNuxtRouteMiddleware(() => {
  // On SSR the auth plugin hasn't hydrated the store yet — skip
  // the check and let the client-side plugin + re-evaluation handle it.
  if (import.meta.server) return

  const authStore = useAuthStore()

  if (!authStore.user?.is_admin) {
    return navigateTo('/dashboard')
  }
})
