<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-key-round" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('API Integration') }}</h2>
        <UBadge v-if="!isMax" color="neutral" variant="subtle" size="xs">{{ t('Max plan') }}</UBadge>
      </div>
    </template>

    <!-- Locked: non-Max users -->
    <div v-if="!isMax" class="space-y-3">
      <p class="text-sm text-(--ui-text-muted)">
        {{ t('Connect your own OpenAI API key for unlimited audits. Available on the Max plan.') }}
      </p>
      <UButton size="sm" variant="outline" icon="i-lucide-zap" to="/pricing">
        {{ t('Upgrade to Max') }}
      </UButton>
    </div>

    <!-- Loading -->
    <div v-else-if="keyLoading" class="space-y-3">
      <USkeleton class="h-5 w-3/4" />
      <USkeleton class="h-5 w-1/2" />
      <USkeleton class="h-8 w-28" />
    </div>

    <!-- Key connected -->
    <div v-else-if="keyStatus?.has_key" class="space-y-4">
      <div class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ t('API key connected') }}</p>
            <p class="mt-0.5 font-mono text-xs text-(--ui-text-muted)">sk-...****</p>
          </div>
          <UBadge color="success" variant="subtle" size="xs" icon="i-lucide-check-circle">
            {{ t('Active') }}
          </UBadge>
        </div>

        <USeparator class="my-3" />

        <div class="flex items-center justify-between">
          <p class="text-xs text-(--ui-text-dimmed)">{{ t('Model') }}</p>
          <p class="text-xs font-medium text-(--ui-text-muted)">{{ keyStatus.model_label || t('Default') }}</p>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton size="sm" variant="outline" icon="i-lucide-pencil" @click="showEditForm = !showEditForm">
          {{ t('Update') }}
        </UButton>
        <UButton
          size="sm"
          variant="outline"
          color="error"
          icon="i-lucide-trash-2"
          :loading="keySaving"
          @click="handleRemoveKey"
        >
          {{ t('Remove key') }}
        </UButton>
      </div>

      <!-- Edit form -->
      <div v-if="showEditForm" class="space-y-3 rounded-lg border border-(--ui-border) p-4">
        <UFormField :label="t('New API key')">
          <UInput v-model="keyForm.api_key" type="password" placeholder="sk-..." class="w-full" />
        </UFormField>
        <UFormField :label="t('Model')">
          <USelect v-model="keyForm.model" :items="modelOptions" class="w-full" />
        </UFormField>
        <div class="flex gap-2">
          <UButton size="sm" icon="i-lucide-save" :loading="keySaving" @click="handleSaveKey">
            {{ t('Save') }}
          </UButton>
          <UButton size="sm" variant="ghost" @click="showEditForm = false">{{ t('Cancel') }}</UButton>
        </div>
      </div>
    </div>

    <!-- No key — add form -->
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

      <UButton
        size="sm"
        icon="i-lucide-plug"
        :loading="keySaving"
        :disabled="!keyForm.api_key"
        @click="handleSaveKey"
      >
        {{ t('Connect API key') }}
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const { isMax } = usePlan()
const { keyStatus, loading: keyLoading, saving: keySaving, fetchStatus, saveKey, removeKey } = useOpenAiKey()

const showEditForm = ref(false)
const keyForm = reactive({ api_key: '', model: '' })

const modelOptions = computed(() =>
  (keyStatus.value?.available_models ?? []).map((m: { value: string; label: string }) => ({
    label: m.label,
    value: m.value,
  })),
)

onMounted(async () => {
  if (!isMax.value) return
  await fetchStatus()
  if (keyStatus.value?.model) {
    keyForm.model = keyStatus.value.model
  } else if (keyStatus.value?.available_models?.length) {
    keyForm.model = keyStatus.value.available_models[0]?.value ?? ''
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
  } catch (e: unknown) {
    const err = e as { response?: { _data?: { errors?: Record<string, string[]>; message?: string } } }
    const message =
      err?.response?._data?.errors?.api_key?.[0] ||
      err?.response?._data?.message ||
      t('Failed to save API key.')
    toast.add({ title: message, color: 'error' })
  }
}

async function handleRemoveKey() {
  try {
    await removeKey()
    toast.add({ title: t('API key removed.'), color: 'success' })
    showEditForm.value = false
    usePlan().invalidateBillingStatus()
  } catch {
    toast.add({ title: t('Failed to remove API key.'), color: 'error' })
  }
}
</script>
