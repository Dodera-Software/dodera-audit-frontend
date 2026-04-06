<template>
  <div>
    <h2 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Sign in to your account') }}</h2>
    <p class="mt-2 text-(--ui-text-muted)">{{ t('Welcome back') }}</p>

    <div class="mt-4">
      <GoogleAuthButton :loading="googleLoading" @click="handleGoogleLogin" />

      <DividerLabel class="my-5">{{ t('or') }}</DividerLabel>
    </div>

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
        />
      </UFormField>

      <UFormField :label="t('Password')" name="password">
        <UInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="********"
          size="lg"
          class="w-full"
        >
          <template #trailing>
            <UButton
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              variant="ghost"
              color="neutral"
              size="sm"
              :aria-label="showPassword ? t('Hide password') : t('Show password')"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="flex items-center justify-between">
        <UButton variant="link" size="xs" to="/auth/forgot-password">
          {{ t('Forgot password?') }}
        </UButton>
      </div>

      <UButton type="submit" :loading="loading" block size="lg">
        {{ t('Sign in') }}
      </UButton>

      <p class="text-center text-sm text-(--ui-text-muted)">
        {{ t("Don't have an account?") }}
        <UButton variant="link" size="xs" to="/register">{{ t('Create one') }}</UButton>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '~/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest', ssr: false })

const { t } = useI18n()
const route = useRoute()
const { login, googleRedirect } = useAuth()
const apiError = useApiError()
const toast = useToast()

const schema = loginSchema(t)
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const googleLoading = ref(false)
const showPassword = ref(false)

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
