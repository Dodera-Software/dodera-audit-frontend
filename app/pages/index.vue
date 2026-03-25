<template>
  <div class="flex min-h-screen items-center justify-center bg-(--ui-bg)">
    <div class="text-center">
      <h1 class="font-display text-5xl font-bold text-(--ui-text-highlighted)">
        {{ t('GhostAudit') }}
      </h1>
      <p class="mt-4 text-lg text-(--ui-text-muted)">
        {{ t('AI-powered page audit platform') }}
      </p>
      <div class="mt-8 flex gap-4 justify-center">
        <UButton to="/login" size="lg">
          {{ t('Sign in') }}
        </UButton>
        <UButton to="/register" size="lg" variant="outline">
          {{ t('Create account') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()
</script>
