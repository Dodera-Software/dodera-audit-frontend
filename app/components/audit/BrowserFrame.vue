<template>
  <div class="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-(--ui-border) bg-black/5 shadow-2xl shadow-black/10">
    <!-- Browser chrome bar -->
    <div class="flex items-center gap-2 border-b border-(--ui-border)/50 bg-(--ui-bg-elevated) px-4 py-2.5">
      <div class="flex gap-1.5">
        <div class="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <div class="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
        <div class="h-2.5 w-2.5 rounded-full bg-green-400/60" />
      </div>
      <div class="ml-3 flex-1 overflow-hidden rounded-md bg-(--ui-bg-accented) px-3 py-1">
        <div class="flex items-center gap-2">
          <UIcon v-if="loading" name="i-lucide-loader-2" class="h-3 w-3 shrink-0 animate-spin text-(--ui-text-dimmed)" />
          <UIcon v-else name="i-lucide-lock" class="h-3 w-3 shrink-0 text-green-500/60" />
          <span class="truncate text-xs text-(--ui-text-dimmed)">{{ url }}</span>
        </div>
      </div>
    </div>

    <!-- Viewport area -->
    <div class="relative aspect-[16/10] w-full bg-(--ui-bg-muted) overflow-hidden">
      <!-- Screenshot background (blurred) when we have one -->
      <img
        v-if="screenshot"
        :src="`data:image/jpeg;base64,${screenshot}`"
        alt=""
        class="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700"
        :class="screenshotBlurred ? 'scale-105 blur-sm brightness-50' : ''"
      />

      <!-- Overlay content (slot) -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <slot />
      </div>

      <!-- Animated scan line -->
      <div v-if="scanLine" class="pointer-events-none absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  url: string
  loading?: boolean
  screenshot?: string | null
  screenshotBlurred?: boolean
  scanLine?: boolean
}>()
</script>

<style scoped>
@keyframes scan-line {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.animate-scan-line {
  animation: scan-line 2.5s ease-in-out infinite;
}
</style>
