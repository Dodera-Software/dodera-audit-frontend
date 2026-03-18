<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-white">Project Details</h1>
    <p class="mt-2 text-surface-400">Project {{ $route.params.id }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
