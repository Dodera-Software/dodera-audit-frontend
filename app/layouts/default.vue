<template>
  <div class="flex min-h-screen bg-(--ui-bg)">
    <!-- Sidebar -->
    <aside class="hidden w-64 flex-shrink-0 border-r border-(--ui-border) bg-(--ui-bg-elevated) lg:block">
      <div class="flex h-16 items-center px-6">
        <NuxtLink to="/dashboard" class="font-display text-xl font-bold text-(--ui-text-highlighted) hover:opacity-80">
          GhostAudit
        </NuxtLink>
      </div>
      <nav class="mt-4 px-3">
        <slot name="sidebar" />
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col">
      <!-- Topbar -->
      <header class="flex h-16 items-center justify-between border-b border-(--ui-border) bg-(--ui-bg-elevated) px-6">
        <div />
        <ClientOnly>
          <div class="flex items-center gap-3">
            <span v-if="authStore.user" class="text-sm text-(--ui-text-muted)">
              {{ authStore.user.name }}
            </span>
            <ThemeSwitcher />
            <UButton variant="ghost" size="sm" icon="i-lucide-log-out" :loading="loggingOut" @click="handleLogout">
              {{ t('Logout') }}
            </UButton>
          </div>
        </ClientOnly>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { logout } = useAuth()
const authStore = useAuthStore()

const loggingOut = ref(false)

async function handleLogout() {
  loggingOut.value = true
  try {
    await logout()
    navigateTo('/login')
  }
  finally {
    loggingOut.value = false
  }
}
</script>
