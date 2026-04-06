import { isAdmin } from '~/constants/roles'

export default defineNuxtRouteMiddleware(() => {
  // On SSR the auth plugin hasn't hydrated the store yet — skip
  // the check and let the client-side plugin + re-evaluation handle it.
  if (import.meta.server) return

  const authStore = useAuthStore()

  if (!isAdmin(authStore.user?.role)) {
    return navigateTo('/dashboard')
  }
})
