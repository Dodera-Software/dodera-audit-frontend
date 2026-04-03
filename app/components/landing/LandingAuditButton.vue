<template>
  <NuxtLink
    to="/register"
    class="group relative inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-10 py-5 text-lg font-black text-black shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_100px_rgba(16,185,129,0.8)] active:scale-100"
  >
    {{ label }}
    <UIcon name="i-lucide-arrow-right" class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  label: string
}

defineProps<Props>()
</script>
