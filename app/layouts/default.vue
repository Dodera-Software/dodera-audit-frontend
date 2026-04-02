<template>
  <div class="flex h-screen bg-zinc-50 dark:bg-zinc-950">
    <!-- Desktop sidebar -->
    <ClientOnly>
      <AppSidebar @navigate="mobileOpen = false" @logout="handleLogout" />
    </ClientOnly>

    <!-- Main content -->
    <div class="flex min-w-0 flex-1 flex-col">
      <AppNavbar @toggle-mobile="mobileOpen = true" />

      <ClientOnly>
        <div v-if="authStore.user && !authStore.isEmailVerified" class="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div class="flex min-w-0 items-center gap-2">
            <UIcon name="i-lucide-mail-warning" class="h-4 w-4 shrink-0 text-amber-500" />
            <p class="truncate text-sm text-amber-800 dark:text-amber-300">{{ t('Please verify your email address to unlock all features.') }}</p>
          </div>
          <UButton size="xs" color="warning" variant="soft" :loading="resendPending" @click="onResend">
            {{ t('Resend email') }}
          </UButton>
        </div>
      </ClientOnly>

      <main ref="mainEl" class="relative min-w-0 flex-1 overflow-y-auto p-5">
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
const { t } = useI18n()
const { logout, resendVerification } = useAuth()
const authStore = useAuthStore()
const toast = useToast()

const mainEl = ref<HTMLElement | null>(null)
const { y: mainScrollY } = useScroll(mainEl)
provide('mainScrollY', mainScrollY)

const mobileOpen = ref(false)
const loggingOut = ref(false)
const resendPending = ref(false)

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

async function onResend() {
  if (resendPending.value) return
  resendPending.value = true
  try {
    await resendVerification()
    toast.add({ title: t('Verification email sent. Check your inbox.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to send verification email. Please try again.'), color: 'error' })
  }
  finally {
    resendPending.value = false
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
