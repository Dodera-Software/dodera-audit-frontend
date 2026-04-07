<template>
  <p class="mt-6 text-center text-sm text-(--ui-text-muted)">
    {{ message }}
    <UButton variant="link" size="xs" :to="linkTo" class="font-semibold">
      {{ linkText }}
    </UButton>
  </p>
</template>

<script setup lang="ts">
interface Props {
  message: string
  linkText: string
  linkTo: string
}

defineProps<Props>()
</script>
