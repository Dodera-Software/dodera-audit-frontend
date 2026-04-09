<template>
  <div class="flex flex-col items-center gap-4">
    <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-(--ui-primary)" />
    <p class="text-(--ui-text-muted)">{{ t('Signing you in...') }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest', ssr: false })

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const token = useAuthToken()
const authStore = useAuthStore()

onMounted(async () => {
  const queryToken = route.query.token as string | undefined

  if (!queryToken) {
    navigateTo('/login?error=google_auth_failed')
    return
  }

  token.value = queryToken
  window.history.replaceState({}, '', '/auth/google/callback')

  try {
    const data = await $fetch<{ data: any }>(`${config.public.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${queryToken}`, Accept: 'application/json' },
    })
    authStore.setUser(data.data)

    const pendingRedirect = sessionStorage.getItem('invitation_redirect')
    sessionStorage.removeItem('invitation_redirect')
    navigateTo(pendingRedirect || '/dashboard')
  }
  catch {
    token.value = null
    authStore.clearUser()
    navigateTo('/login?error=google_auth_failed')
  }
})
</script>
