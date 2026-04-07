<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-triangle-alert" class="h-4 w-4 text-red-500" />
        <h2 class="text-sm font-semibold text-red-500">{{ t('Danger zone') }}</h2>
      </div>
    </template>

    <p class="text-sm text-(--ui-text-muted)">
      {{ t('Once you delete your account, there is no going back. All your projects, pages, audits, and data will be permanently removed.') }}
    </p>
    <UButton
      class="mt-3"
      color="error"
      variant="outline"
      size="sm"
      icon="i-lucide-trash-2"
      block
      @click="showDialog = true"
    >
      {{ t('Delete account') }}
    </UButton>

    <!-- Deletion confirmation modal -->
    <UModal v-model:open="showDialog">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <UIcon name="i-lucide-triangle-alert" class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Delete your account?') }}</h3>
              <p class="text-sm text-(--ui-text-muted)">{{ t('This action is permanent and cannot be undone.') }}</p>
            </div>
          </div>

          <div class="mt-5 space-y-3 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-4 text-sm text-(--ui-text-muted)">
            <p>{{ t('Deleting your account will:') }}</p>
            <ul class="list-inside list-disc space-y-1">
              <li>{{ t('Remove all your projects, pages, and audit history') }}</li>
              <li>{{ t('Cancel any active subscription') }}</li>
              <li>{{ t('Remove you from any teams') }}</li>
              <li>{{ t('Delete your personal information') }}</li>
            </ul>
          </div>

          <!-- Password confirmation (for email users) -->
          <div v-if="requiresPassword" class="mt-4">
            <UFormField :label="t('Confirm your password')">
              <UInput v-model="password" type="password" class="w-full" :placeholder="t('Enter your password')" />
            </UFormField>
          </div>

          <!-- Type DELETE confirmation -->
          <div class="mt-4">
            <UFormField :label="t('Type DELETE to confirm')">
              <UInput v-model="confirmation" class="w-full" placeholder="DELETE" />
            </UFormField>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <UButton variant="ghost" @click="showDialog = false">{{ t('Cancel') }}</UButton>
            <UButton
              color="error"
              :loading="deleting"
              :disabled="!canSubmit"
              @click="handleDelete"
            >
              {{ t('Delete my account') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const apiError = useApiError()
const authStore = useAuthStore()
const { logout } = useAuth()

const showDialog = ref(false)
const password = ref('')
const confirmation = ref('')
const deleting = ref(false)

const requiresPassword = computed(() => authStore.user?.auth_provider !== 'google')

const canSubmit = computed(() => {
  if (confirmation.value !== 'DELETE') return false
  if (requiresPassword.value && !password.value) return false
  return true
})

async function handleDelete() {
  deleting.value = true
  try {
    await $api('/user', {
      method: 'DELETE',
      body: {
        confirmation: confirmation.value,
        ...(requiresPassword.value ? { password: password.value } : {}),
      },
    })
    toast.add({ title: t('Account deleted. Goodbye.'), color: 'success' })
    await logout()
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to delete account.')).message, color: 'error' })
  }
  finally {
    deleting.value = false
  }
}
</script>
