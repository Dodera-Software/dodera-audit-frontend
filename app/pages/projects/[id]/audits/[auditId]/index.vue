<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-white">Audit Report</h1>
    <p class="mt-2 text-surface-400">Audit {{ $route.params.auditId }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
