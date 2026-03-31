<template>
  <header class="flex h-12 items-center justify-between border-b border-(--ui-border) px-4">
    <!-- Mobile: logo + hamburger -->
    <div class="flex items-center gap-2 lg:hidden">
      <UButton variant="ghost" size="xs" icon="i-lucide-menu" square @click="$emit('toggle-mobile')" />
      <NuxtLink to="/dashboard" class="text-sm font-bold text-(--ui-text-highlighted)">
        PawByTech
      </NuxtLink>
    </div>

    <!-- Desktop: left area (breadcrumbs / context) -->
    <div class="hidden lg:block" />

    <!-- Right side: compact actions -->
    <div class="flex items-center gap-1">
      <!-- Mobile only: user avatar linking to account -->
      <NuxtLink to="/account" class="lg:hidden">
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-(--ui-primary)/15 text-xs font-semibold text-(--ui-primary)">
          {{ userInitial }}
        </div>
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  'toggle-mobile': []
}>()

const authStore = useAuthStore()
const userInitial = computed(() => (authStore.user?.name ?? '').charAt(0).toUpperCase())
</script>
