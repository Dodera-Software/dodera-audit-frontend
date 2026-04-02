<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-lock-keyhole" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Security') }}</h2>
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
      :title="t('Password updated successfully!')"
      icon="i-lucide-check-circle"
      class="mb-4"
    />

    <UForm :schema="schema" :state="form" class="space-y-4" @submit="submit">
      <UFormField :label="t('Current password')" name="current_password">
        <UInput
          v-model="form.current_password"
          type="password"
          size="lg"
          class="w-full"
          :placeholder="t('Enter your current password')"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField :label="t('New password')" name="password">
          <UInput
            v-model="form.password"
            type="password"
            size="lg"
            class="w-full"
            :placeholder="t('Min. 8 characters')"
          />
        </UFormField>

        <UFormField :label="t('Confirm new password')" name="password_confirmation">
          <UInput
            v-model="form.password_confirmation"
            type="password"
            size="lg"
            class="w-full"
            :placeholder="t('Repeat password')"
          />
        </UFormField>
      </div>

      <div class="flex justify-end">
        <UButton type="submit" :loading="loading" icon="i-lucide-shield-check">
          {{ t('Change password') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { error, loading, success, schema, form, submit } = usePasswordForm()
</script>
