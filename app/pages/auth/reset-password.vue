<template>
  <div>
    <h2 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Reset your password') }}</h2>
    <p class="mt-2 text-(--ui-text-muted)">{{ t('Enter your new password below.') }}</p>

    <UForm :schema="schema" :state="form" class="mt-4 space-y-5" @submit="handleSubmit">
      <UAlert
        v-if="apiError.hasErrors.value"
        color="error"
        variant="subtle"
        :title="apiError.displayMessage.value"
        icon="i-lucide-alert-circle"
      />

      <UAlert
        v-if="success"
        color="primary"
        variant="subtle"
        icon="i-lucide-check-circle"
      >
        {{ t('Password reset successfully.') }}
        <UButton variant="link" size="xs" to="/login">{{ t('Sign in') }}</UButton>
      </UAlert>

      <template v-if="!success">
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

        <UFormField :label="t('New password')" name="password">
          <UInput
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            :placeholder="t('Min. 8 characters')"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('Confirm new password')" name="password_confirmation">
          <UInput
            v-model="form.password_confirmation"
            type="password"
            autocomplete="new-password"
            :placeholder="t('Repeat password')"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UButton type="submit" :loading="loading" block size="lg">
          {{ t('Reset password') }}
        </UButton>
      </template>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { resetPasswordSchema } from '~/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest', ssr: false })

const { t } = useI18n()
const route = useRoute()
const { resetPassword } = useAuth()
const apiError = useApiError()

const schema = resetPasswordSchema(t)
const form = reactive({
  email: (route.query.email as string) || '',
  password: '',
  password_confirmation: '',
})
const loading = ref(false)
const success = ref(false)

async function handleSubmit() {
  loading.value = true
  apiError.clear()

  try {
    await resetPassword({
      token: route.query.token as string,
      ...form,
    })
    success.value = true
  }
  catch (e) {
    apiError.parse(e, t('Failed to reset password.'))
  }
  finally {
    loading.value = false
  }
}
</script>
