<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-user-round" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Personal information') }}</h2>
      </div>
    </template>

    <UAlert
      v-if="error.hasErrors.value"
      color="error"
      variant="subtle"
      :title="error.displayMessage.value"
      icon="i-lucide-alert-circle"
      class="mb-4"
    />
    <UAlert
      v-if="success"
      color="success"
      variant="subtle"
      :title="t('Profile updated successfully!')"
      icon="i-lucide-check-circle"
      class="mb-4"
    />

    <UForm :schema="schema" :state="form" class="space-y-5" @submit="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField :label="t('Full name')" name="name">
          <UInput
            v-model="form.name"
            size="lg"
            class="w-full"
            :placeholder="t('Your full name')"
          />
        </UFormField>

        <UFormField :label="t('Email address')">
          <UInput
            :model-value="authStore.user?.email"
            size="lg"
            class="w-full"
            disabled
          />
        </UFormField>
      </div>


      <div class="flex justify-end">
        <UButton type="submit" :loading="loading" icon="i-lucide-save">
          {{ t('Save changes') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const { error, loading, success, schema, form, submit } = useProfileForm()
</script>
