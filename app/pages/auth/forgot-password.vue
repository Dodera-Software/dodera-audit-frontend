<template>
  <div>
    <h2 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Forgot your password?') }}</h2>
    <p class="mt-2 text-(--ui-text-muted)">{{ t("Enter your email and we'll send you a reset link.") }}</p>

    <UForm :schema="schema" :state="form" class="mt-4 space-y-5" @submit="handleSubmit">
      <UAlert
        v-if="apiError.hasErrors.value"
        color="error"
        variant="subtle"
        :title="apiError.displayMessage.value"
        icon="i-lucide-alert-circle"
      />

      <UAlert
        v-if="sent"
        color="primary"
        variant="subtle"
        :title="t('Password reset link sent. Check your email.')"
        icon="i-lucide-mail-check"
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

      <UButton type="submit" :loading="loading" :disabled="sent" block size="lg">
        {{ t('Send reset link') }}
      </UButton>

      <p class="text-center text-sm">
        <NuxtLink to="/login" class="text-(--ui-text-highlighted) hover:underline">{{ t('Back to login') }}</NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { forgotPasswordSchema } from '~/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const { forgotPassword } = useAuth()
const apiError = useApiError()

const schema = forgotPasswordSchema(t)
const form = reactive({ email: '' })
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  apiError.clear()

  try {
    await forgotPassword(form.email)
    sent.value = true
  }
  catch (e) {
    apiError.parse(e, t('Failed to send reset link.'))
  }
  finally {
    loading.value = false
  }
}
</script>
