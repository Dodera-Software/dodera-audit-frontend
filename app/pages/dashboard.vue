<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Dashboard') }}</h1>
    <p class="mt-2 text-(--ui-text-muted)">{{ t('Your projects overview') }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
</script>
