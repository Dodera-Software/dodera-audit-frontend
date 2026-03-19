<template>
  <div>
    <h2 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Sign in to your account') }}</h2>
    <p class="mt-2 text-(--ui-text-muted)">{{ t('Welcome back') }}</p>

    <UForm :schema="schema" :state="form" class="mt-4 space-y-5" @submit="handleLogin">
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
          type="password"
          autocomplete="current-password"
          placeholder="********"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <div class="flex items-center justify-between">
        <NuxtLink to="/auth/forgot-password" class="text-sm text-(--ui-text-highlighted) hover:underline">
          {{ t('Forgot password?') }}
        </NuxtLink>
      </div>

      <UButton type="submit" :loading="loading" block size="lg">
        {{ t('Sign in') }}
      </UButton>

      <p class="text-center text-sm text-(--ui-text-muted)">
        {{ t("Don't have an account?") }}
        <NuxtLink to="/register" class="text-(--ui-text-highlighted) hover:underline">{{ t('Create one') }}</NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '~/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const route = useRoute()
const { login } = useAuth()
const apiError = useApiError()

const schema = loginSchema(t)
const form = reactive({ email: '', password: '' })
const loading = ref(false)

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
