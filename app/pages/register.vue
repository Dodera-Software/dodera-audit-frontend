<template>
  <div>
    <h2 class="text-2xl font-bold text-white">Create your account</h2>
    <p class="mt-2 text-surface-400">Start auditing in minutes</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
</script>
