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
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :placeholder="t('Min. 8 characters')"
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

      <UFormField :label="t('Confirm password')" name="password_confirmation">
        <UInput
          v-model="form.password_confirmation"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          :placeholder="t('Repeat password')"
          size="lg"
          class="w-full"
        >
          <template #trailing>
            <UButton
              :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              variant="ghost"
              color="neutral"
              size="sm"
              :aria-label="showConfirmPassword ? t('Hide password') : t('Show password')"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </UInput>
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

definePageMeta({ layout: 'auth', middleware: 'guest', ssr: false })

const { t } = useI18n()
const route = useRoute()
const { register } = useAuth()
const apiError = useApiError()

const invitationToken = route.query.invitation as string | undefined

const schema = registerSchema(t)
const form = reactive({
  name: '',
  email: (route.query.email as string) || '',
  password: '',
  password_confirmation: '',
  terms: false as boolean,
})
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleRegister() {
  loading.value = true
  apiError.clear()

  try {
    await register(form)
    if (invitationToken) {
      navigateTo(`/invitation/${invitationToken}`)
    }
    else {
      navigateTo('/auth/verify-email')
    }
  }
  catch (e) {
    apiError.parse(e, t('Registration failed. Please try again.'))
  }
  finally {
    loading.value = false
  }
}
</script>
