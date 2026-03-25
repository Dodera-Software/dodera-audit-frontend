<template>
  <div>
    <h2 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Create your account') }}</h2>
    <p class="mt-2 text-(--ui-text-muted)">{{ t('Start auditing in minutes') }}</p>

    <UForm :schema="schema" :state="form" class="mt-4 space-y-5" @submit="handleRegister">
      <UAlert
        v-if="apiError.hasErrors.value"
        color="error"
        variant="subtle"
        :title="apiError.displayMessage.value"
        icon="i-lucide-alert-circle"
      />

      <UFormField :label="t('Name')" name="name">
        <UInput
          v-model="form.name"
          type="text"
          autocomplete="name"
          :placeholder="t('Your name')"
          size="lg"
          class="w-full"
        />
      </UFormField>

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
          autocomplete="new-password"
          :placeholder="t('Min. 8 characters')"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('Confirm password')" name="password_confirmation">
        <UInput
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          :placeholder="t('Repeat password')"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField name="terms">
        <UCheckbox v-model="form.terms" :label="t('I agree to the Terms of Service and Privacy Policy')" />
      </UFormField>

      <UButton type="submit" :loading="loading" block size="lg">
        {{ t('Create account') }}
      </UButton>

      <p class="text-center text-sm text-(--ui-text-muted)">
        {{ t('Already have an account?') }}
        <UButton variant="link" size="xs" to="/login">{{ t('Sign in') }}</UButton>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { registerSchema } from '~/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const { register } = useAuth()
const apiError = useApiError()

const schema = registerSchema(t)
const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  terms: false as boolean,
})
const loading = ref(false)

async function handleRegister() {
  loading.value = true
  apiError.clear()

  try {
    await register(form)
    navigateTo('/auth/verify-email')
  }
  catch (e) {
    apiError.parse(e, t('Registration failed. Please try again.'))
  }
  finally {
    loading.value = false
  }
}
</script>
