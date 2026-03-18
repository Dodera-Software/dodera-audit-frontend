<template>
  <div>
    <h2 class="text-2xl font-bold text-white">Sign in to your account</h2>
    <p class="mt-2 text-surface-400">Welcome back</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
</script>
