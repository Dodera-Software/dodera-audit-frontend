<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-white">Optimization Board</h1>
    <p class="mt-2 text-surface-400">Kanban board for project {{ $route.params.id }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
