<template>
  <div class="mb-8 text-center">
    <h2 class="text-3xl font-bold tracking-tight text-(--ui-text-highlighted)">
      {{ title }}
    </h2>
    <p class="mt-2 text-base text-(--ui-text-muted)">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>
