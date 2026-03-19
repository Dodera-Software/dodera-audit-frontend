export default defineNuxtPlugin(async () => {
  const token = useAuthToken()
  const authStore = useAuthStore()

  if (token.value && !authStore.user) {
    try {
      const { fetchMe } = useAuth()
      await fetchMe()
    }
    catch {
      token.value = null
      authStore.clearUser()
    }
  }
})
