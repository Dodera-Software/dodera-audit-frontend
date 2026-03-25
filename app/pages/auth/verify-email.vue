<template>
  <div>
    <h2 class="text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Check your email') }}</h2>
    <p class="mt-2 text-(--ui-text-muted)">{{ t('We sent a verification link to your email address. Click the link to verify your account.') }}</p>

    <div class="mt-4 space-y-4">
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
        :title="t('Verification email sent.')"
        icon="i-lucide-mail"
      />

      <UButton
        :loading="loading"
        :disabled="cooldown > 0"
        block
        size="lg"
        @click="handleResend"
      >
        <template v-if="cooldown > 0">{{ t('Resend in') }} {{ cooldown }}s</template>
        <template v-else>{{ t('Resend verification email') }}</template>
      </UButton>

      <div class="text-center">
        <UButton variant="link" size="sm" to="/dashboard">
          {{ t('Continue to dashboard') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const { resendVerification } = useAuth()
const apiError = useApiError()

const loading = ref(false)
const success = ref(false)
const cooldown = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

function startCooldown() {
  cooldown.value = 60
  timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function handleResend() {
  loading.value = true
  apiError.clear()
  success.value = false

  try {
    await resendVerification()
    success.value = true
    startCooldown()
  }
  catch (e) {
    apiError.parse(e, t('Failed to send verification email.'))
  }
  finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
