<template>
  <div class="flex h-screen bg-zinc-50 dark:bg-zinc-950">
    <!-- Desktop sidebar -->
    <ClientOnly>
      <AppSidebar @navigate="mobileOpen = false" @logout="handleLogout" />
    </ClientOnly>

    <!-- Main content -->
    <div class="flex min-w-0 flex-1 flex-col">
      <ClientOnly>
        <AppNavbar v-if="showNavbar" @toggle-mobile="mobileOpen = true" />
        <!-- Mobile-only: just a hamburger row when navbar is hidden -->
        <div v-else class="flex h-12 items-center border-b border-(--ui-border) bg-(--ui-bg) px-4 lg:hidden">
          <UButton variant="ghost" size="xs" icon="i-lucide-menu" square @click="mobileOpen = true" />
          <NuxtLink to="/dashboard" class="ml-2">
            <img src="~/assets/logo/pawbytech-logo.svg" alt="PawByTech" class="h-6 w-auto" />
          </NuxtLink>
        </div>
      </ClientOnly>

      <main class="relative min-w-0 flex-1 overflow-y-auto p-5">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="mobileOpen" class="fixed inset-0 z-50 bg-black/50 lg:hidden" @click="mobileOpen = false" />
        </Transition>
        <Transition name="slide">
          <div v-if="mobileOpen" class="fixed inset-y-0 left-0 z-50 lg:hidden">
            <AppSidebar mobile @navigate="mobileOpen = false" @logout="handleLogout" />
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  showNavbar?: boolean
}>(), {
  showNavbar: false,
})

const { logout } = useAuth()

const mobileOpen = ref(false)
const loggingOut = ref(false)

async function handleLogout() {
  if (loggingOut.value) return
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
