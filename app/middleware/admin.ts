export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.user?.is_admin) {
    return navigateTo('/dashboard')
  }
})
