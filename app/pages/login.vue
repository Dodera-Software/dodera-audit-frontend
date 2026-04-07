<template>
  <div>
    <AuthFormHeader
      :title="t('Welcome back')"
      :subtitle="t('Sign in to see your audits, scores, and improvement history.')"
    />

    <GoogleAuthButton :loading="googleLoading" @click="handleGoogleLogin" />

    <DividerLabel class="my-6">{{ t('or continue with email') }}</DividerLabel>

    <UForm :schema="schema" :state="form" class="space-y-5" @submit="handleLogin">
      <UAlert
        v-if="apiError.hasErrors.value"
        color="error"
        variant="subtle"
        :title="apiError.displayMessage.value"
        icon="i-lucide-alert-circle"
      />

      <UFormField :label="t('Email')" name="email">
        <UInput
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          size="lg"
          class="w-full"
          icon="i-lucide-mail"
        />
      </UFormField>

      <UFormField :label="t('Password')" name="password">
        <AuthPasswordInput v-model="form.password" autocomplete="current-password" />
      </UFormField>

      <div class="flex justify-end">
        <UButton variant="link" size="xs" to="/auth/forgot-password" class="h-auto p-0 text-xs">
          {{ t('Forgot password?') }}
        </UButton>
      </div>

      <UButton type="submit" :loading="loading" block size="lg">
        {{ t('Sign in') }}
      </UButton>
    </UForm>

    <AuthFormFooter
      :message="t('Don\u0027t have an account?')"
      :link-text="t('Create one')"
      link-to="/register"
    />
  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '~/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const route = useRoute()
const { login, googleRedirect } = useAuth()
const apiError = useApiError()
const toast = useToast()

const schema = loginSchema(t)
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const googleLoading = ref(false)

onMounted(() => {
  if (route.query.verified === '1') {
    toast.add({ title: t('Email verified!'), description: t('Your email has been verified. You can now sign in.'), color: 'success' })
  }
  if (route.query.error === 'google_auth_failed') {
    apiError.parse(null, t('Google sign-in failed. Please try again.'))
  }
})

async function handleGoogleLogin() {
  googleLoading.value = true
  try {
    await googleRedirect()
  }
  catch {
    apiError.parse(null, t('Could not connect to Google. Please try again.'))
    googleLoading.value = false
  }
}

async function handleLogin() {
  loading.value = true
  apiError.clear()

  try {
    await login(form)
    const redirect = (route.query.redirect as string) || '/dashboard'
    navigateTo(redirect)
  }
  catch (e) {
    apiError.parse(e, t('Login failed. Please try again.'))
  }
  finally {
    loading.value = false
  }
}
</script>
