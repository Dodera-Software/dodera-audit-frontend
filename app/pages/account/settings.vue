<template>
  <ClientOnly>
    <div class="max-w-2xl space-y-6">

      <!-- Appearance -->
      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Appearance') }}</h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Theme') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('Choose how PawByTech looks to you.') }}</p>
            </div>
            <div class="flex gap-1">
              <UButton
                v-for="mode in themeModes"
                :key="mode.value"
                :icon="mode.icon"
                :variant="colorMode.preference === mode.value ? 'soft' : 'ghost'"
                :color="colorMode.preference === mode.value ? 'primary' : 'neutral'"
                size="xs"
                @click="colorMode.preference = mode.value"
              >
                {{ mode.label }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Notifications (placeholder) -->
      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Notifications') }}</h2>
        </template>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Audit completed') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('Get notified when an audit finishes.') }}</p>
            </div>
            <USwitch v-model="notifications.auditCompleted" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Regression detected') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('Get alerted when a score drops significantly.') }}</p>
            </div>
            <USwitch v-model="notifications.regressionDetected" />
          </div>
        </div>
      </UCard>

      <!-- API Integration (Max plan only) -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('API Integration') }}</h2>
            <UBadge v-if="!isMax" color="neutral" variant="subtle" size="xs">{{ t('Max plan') }}</UBadge>
          </div>
        </template>

        <!-- Locked state for non-Max users -->
        <div v-if="!isMax" class="space-y-2">
          <p class="text-sm text-(--ui-text-muted)">
            {{ t('Connect your own OpenAI API key for unlimited audits. Available on the Max plan.') }}
          </p>
          <UButton size="sm" variant="outline" to="/pricing">{{ t('Upgrade to Max') }}</UButton>
        </div>

        <!-- Loading state -->
        <UiSkeletonApiKey v-else-if="keyLoading" />

        <!-- Key is set -->
        <div v-else-if="keyStatus?.has_key" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('API key connected') }}</p>
              <p class="text-xs text-(--ui-text-muted)">
                sk-...{{ maskedKeySuffix }}
              </p>
            </div>
            <UBadge color="success" variant="subtle" size="xs">{{ t('Active') }}</UBadge>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('Model') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ keyStatus.model_label || t('Default') }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton size="sm" variant="outline" @click="showEditForm = true">{{ t('Update') }}</UButton>
            <UButton size="sm" variant="outline" color="error" :loading="keySaving" @click="handleRemoveKey">
              {{ t('Remove key') }}
            </UButton>
          </div>

          <!-- Edit form (shown when updating) -->
          <div v-if="showEditForm" class="mt-4 space-y-3 border-t border-(--ui-border) pt-4">
            <UFormField :label="t('New API key')">
              <UInput v-model="keyForm.api_key" type="password" placeholder="sk-..." class="w-full" />
            </UFormField>
            <UFormField :label="t('Model')">
              <USelect v-model="keyForm.model" :items="modelOptions" class="w-full" />
            </UFormField>
            <div class="flex gap-2">
              <UButton size="sm" :loading="keySaving" @click="handleSaveKey">{{ t('Save') }}</UButton>
              <UButton size="sm" variant="ghost" @click="showEditForm = false">{{ t('Cancel') }}</UButton>
            </div>
          </div>
        </div>

        <!-- No key set — show form -->
        <div v-else class="space-y-4">
          <p class="text-sm text-(--ui-text-muted)">
            {{ t('Connect your own OpenAI API key to unlock unlimited audits and choose your preferred model.') }}
          </p>

          <UFormField :label="t('API key')">
            <UInput v-model="keyForm.api_key" type="password" placeholder="sk-..." class="w-full" />
          </UFormField>

          <UFormField :label="t('Model')">
            <USelect v-model="keyForm.model" :items="modelOptions" class="w-full" />
          </UFormField>

          <UButton size="sm" :loading="keySaving" :disabled="!keyForm.api_key" @click="handleSaveKey">
            {{ t('Connect API key') }}
          </UButton>
        </div>
      </UCard>

      <!-- Danger zone -->
      <UCard>
        <template #header>
          <h2 class="text-sm font-semibold text-red-500">{{ t('Danger zone') }}</h2>
        </template>
        <p class="text-sm text-(--ui-text-muted)">{{ t('Once you delete your account, there is no going back.') }}</p>
        <UButton class="mt-3" color="error" variant="outline" size="sm" disabled>
          {{ t('Delete account') }}
        </UButton>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const colorMode = useColorMode()
const toast = useToast()
const { setNavbar } = usePageNavbar()
const { isMax } = usePlan()
const { keyStatus, loading: keyLoading, saving: keySaving, fetchStatus, saveKey, removeKey } = useOpenAiKey()

onMounted(() => {
  setNavbar({ title: t('Settings'), showBack: true })
})

const themeModes = computed(() => [
  { value: 'light', icon: 'i-lucide-sun', label: t('Light') },
  { value: 'dark', icon: 'i-lucide-moon', label: t('Dark') },
  { value: 'system', icon: 'i-lucide-monitor', label: t('System') },
])

// Placeholder — will be wired to API later
const notifications = reactive({
  auditCompleted: true,
  regressionDetected: true,
})

// API key form
const showEditForm = ref(false)
const keyForm = reactive({ api_key: '', model: '' })

const modelOptions = computed(() =>
  (keyStatus.value?.available_models ?? []).map((m: { value: string; label: string }) => ({
    label: m.label,
    value: m.value,
  })),
)

const maskedKeySuffix = computed(() => {
  // We don't have the full key, just show a placeholder
  return '****'
})

onMounted(async () => {
  if (isMax.value) {
    await fetchStatus()
    if (keyStatus.value?.model) {
      keyForm.model = keyStatus.value.model
    }
    else if (keyStatus.value?.available_models?.length) {
      keyForm.model = keyStatus.value.available_models[0]?.value ?? ''
    }
  }
})

async function handleSaveKey() {
  if (!keyForm.api_key) return
  try {
    await saveKey(keyForm.api_key, keyForm.model)
    toast.add({ title: t('API key saved successfully.'), color: 'success' })
    keyForm.api_key = ''
    showEditForm.value = false
    usePlan().invalidateBillingStatus()
  }
  catch (e: unknown) {
    const err = e as { response?: { _data?: { errors?: Record<string, string[]>, message?: string } } }
    const message = err?.response?._data?.errors?.api_key?.[0]
      || err?.response?._data?.message
      || t('Failed to save API key.')
    toast.add({ title: message, color: 'error' })
  }
}

async function handleRemoveKey() {
  try {
    await removeKey()
    toast.add({ title: t('API key removed.'), color: 'success' })
    showEditForm.value = false
    usePlan().invalidateBillingStatus()
  }
  catch {
    toast.add({ title: t('Failed to remove API key.'), color: 'error' })
  }
}
</script>
