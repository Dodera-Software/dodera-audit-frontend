<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Project Details') }}</h1>
    <p class="mt-2 text-(--ui-text-muted)">{{ $route.params.id }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
</script>
