<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-white">Dashboard</h1>
    <p class="mt-2 text-surface-400">Your projects overview</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
