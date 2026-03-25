<template>
  <ClientOnly>
  <div class="max-w-2xl space-y-8">
    <div class="flex items-center gap-4">
      <UButton variant="ghost" icon="i-lucide-arrow-left" size="xs" @click="router.back()" />
      <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ t('Profile') }}</h1>
    </div>

    <!-- Profile section -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Profile') }}</h2>
      </template>

      <UForm :schema="profileSchema" :state="profileForm" class="space-y-4" @submit="handleUpdateProfile">
        <UAlert
          v-if="profileError.hasErrors.value"
          color="error"
          variant="subtle"
          :title="profileError.displayMessage.value"
          icon="i-lucide-alert-circle"
        />
        <UAlert
          v-if="profileSuccess"
          color="primary"
          variant="subtle"
          :title="t('Profile updated.')"
          icon="i-lucide-check-circle"
        />

        <UFormField :label="t('Name')" name="name">
          <UInput v-model="profileForm.name" size="lg" class="w-full" />
        </UFormField>

        <UFormField :label="t('Email')">
          <UInput :model-value="authStore.user?.email" size="lg" class="w-full" disabled />
        </UFormField>

        <UFormField :label="t('Plan')">
          <UBadge :color="planColor" size="lg">{{ authStore.user?.plan?.toUpperCase() }}</UBadge>
        </UFormField>

        <div v-if="stats" class="flex gap-6 text-sm text-(--ui-text-muted)">
          <span>{{ t('Projects') }}: {{ stats.projects_count }}</span>
          <span>{{ t('Audits this month') }}: {{ stats.audits_this_month }}</span>
        </div>

        <UButton type="submit" :loading="profileLoading">
          {{ t('Save changes') }}
        </UButton>
      </UForm>
    </UCard>

    <!-- Security section -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Security') }}</h2>
      </template>

      <UForm :schema="passwordSchema" :state="passwordForm" class="space-y-4" @submit="handleUpdatePassword">
        <UAlert
          v-if="passwordError.hasErrors.value"
          color="error"
          variant="subtle"
          :title="passwordError.displayMessage.value"
          icon="i-lucide-alert-circle"
        />
        <UAlert
          v-if="passwordSuccess"
          color="primary"
          variant="subtle"
          :title="t('Password updated.')"
          icon="i-lucide-check-circle"
        />

        <UFormField :label="t('Current password')" name="current_password">
          <UInput v-model="passwordForm.current_password" type="password" size="lg" class="w-full" />
        </UFormField>

        <UFormField :label="t('New password')" name="password">
          <UInput v-model="passwordForm.password" type="password" :placeholder="t('Min. 8 characters')" size="lg" class="w-full" />
        </UFormField>

        <UFormField :label="t('Confirm new password')" name="password_confirmation">
          <UInput v-model="passwordForm.password_confirmation" type="password" :placeholder="t('Repeat password')" size="lg" class="w-full" />
        </UFormField>

        <UButton type="submit" :loading="passwordLoading">
          {{ t('Change password') }}
        </UButton>
      </UForm>
    </UCard>

  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const router = useRouter()
const { $api } = useApi()
const { fetchMe } = useAuth()
const authStore = useAuthStore()

const profileError = useApiError()
const passwordError = useApiError()
const profileLoading = ref(false)
const passwordLoading = ref(false)
const profileSuccess = ref(false)
const passwordSuccess = ref(false)

const profileSchema = z.object({
  name: z.string().min(1, t('Name is required')).max(255),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, t('Current password is required')),
  password: z.string().min(8, t('Password must be at least 8 characters')),
  password_confirmation: z.string().min(1, t('Confirm your password')),
}).refine(data => data.password === data.password_confirmation, {
  message: t('Passwords do not match'),
  path: ['password_confirmation'],
})

const profileForm = reactive({ name: authStore.user?.name || '' })
const passwordForm = reactive({ current_password: '', password: '', password_confirmation: '' })

const stats = ref<{ plan: string, projects_count: number, audits_this_month: number } | null>(null)

const planColor = computed(() => {
  switch (authStore.user?.plan) {
    case 'agency': return 'primary'
    case 'pro': return 'primary'
    default: return 'neutral'
  }
})

onMounted(async () => {
  try {
    stats.value = await $api('/user/stats')
  }
  catch {}
})

async function handleUpdateProfile() {
  profileLoading.value = true
  profileError.clear()
  profileSuccess.value = false

  try {
    await $api('/user', { method: 'PATCH', body: profileForm })
    await fetchMe()
    profileSuccess.value = true
  }
  catch (e) {
    profileError.parse(e, t('Failed to update profile.'))
  }
  finally {
    profileLoading.value = false
  }
}

async function handleUpdatePassword() {
  passwordLoading.value = true
  passwordError.clear()
  passwordSuccess.value = false

  try {
    await $api('/user/password', { method: 'PATCH', body: passwordForm })
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    passwordSuccess.value = true
  }
  catch (e) {
    passwordError.parse(e, t('Failed to update password.'))
  }
  finally {
    passwordLoading.value = false
  }
}
</script>
