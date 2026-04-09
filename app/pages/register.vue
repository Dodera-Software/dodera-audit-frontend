<template>
  <div>
    <AuthFormHeader
      :title="t('Start improving your website today')"
      :subtitle="t('Free account. No credit card. Your first audit runs in under 3 minutes.')"
    />

    <GoogleAuthButton action="signup" :loading="googleLoading" @click="handleGoogleRegister" />

    <DividerLabel class="my-6">{{ t('or continue with email') }}</DividerLabel>

    <UForm :schema="schema" :state="form" class="space-y-4" @submit="handleRegister">
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
          icon="i-lucide-user"
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
          icon="i-lucide-mail"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-3">
        <UFormField :label="t('Password')" name="password">
          <AuthPasswordInput
            v-model="form.password"
            autocomplete="new-password"
            :placeholder="t('Min. 8 chars')"
          />
        </UFormField>

        <UFormField :label="t('Confirm password')" name="password_confirmation">
          <AuthPasswordInput
            v-model="form.password_confirmation"
            autocomplete="new-password"
            :placeholder="t('Repeat')"
            icon="i-lucide-lock-keyhole"
          />
        </UFormField>
      </div>

      <UFormField name="terms">
        <UCheckbox
          v-model="form.terms"
          :label="t('I agree to the Terms of Service and Privacy Policy')"
        />
      </UFormField>

      <UButton type="submit" :loading="loading" block size="lg" class="mt-1">
        {{ t('Create account') }}
      </UButton>
    </UForm>

    <AuthFormFooter
      :message="t('Already have an account?')"
      :link-text="t('Sign in')"
      link-to="/login"
    />
  </div>
</template>

<script setup lang="ts">
import { registerSchema } from '~/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { t } = useI18n()
const route = useRoute()
const { register, googleRedirect } = useAuth()
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
const googleLoading = ref(false)

async function handleGoogleRegister() {
  googleLoading.value = true
  try {
    if (invitationToken) {
      sessionStorage.setItem('invitation_redirect', `/invitation/${invitationToken}`)
    }
    await googleRedirect()
  }
  catch {
    apiError.parse(null, t('Could not connect to Google. Please try again.'))
    googleLoading.value = false
  }
}

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
