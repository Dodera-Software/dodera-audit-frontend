<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-950">
    <div class="text-center">
      <h1 class="font-display text-5xl font-bold text-white">
        GhostAudit
      </h1>
      <p class="mt-4 text-lg text-surface-400">
        AI-powered website audit platform
      </p>
      <div class="mt-8 flex gap-4 justify-center">
        <NuxtLink to="/login" class="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700 transition-colors">
          Sign in
        </NuxtLink>
        <NuxtLink to="/register" class="rounded-lg border border-surface-600 px-6 py-3 font-medium text-surface-200 hover:bg-surface-800 transition-colors">
          Create account
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
</script>
