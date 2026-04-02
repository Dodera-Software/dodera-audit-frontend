<template>
  <header
    v-show="!navbarState.hidden"
    class="flex h-14 shrink-0 items-center justify-between border-b border-(--ui-border) bg-(--ui-bg)/80 px-4 backdrop-blur-md transition-shadow duration-200"
    :class="hasScrolled ? 'shadow-sm' : 'shadow-none'"
  >
    <!-- Left: always-visible mobile strip + desktop content -->
    <div class="flex min-w-0 items-center gap-1">
      <!-- Mobile: hamburger + logo only -->
      <UButton
        class="lg:hidden"
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-lucide-menu"
        square
        @click="$emit('toggle-mobile')"
      />
      <NuxtLink to="/dashboard" class="lg:hidden">
        <img src="~/assets/logo/pawbytech-logo.png" alt="PawByTech" class="h-8 w-auto" />
      </NuxtLink>

      <!-- Desktop: back button + page title -->
      <div class="hidden items-center gap-1 lg:flex">
        <UButton
          v-if="navbarState.showBack"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-arrow-left"
          square
          aria-label="Go back"
          @click="handleBack"
        />

        <div v-if="navbarState.title" class="min-w-0">
          <h1 class="truncate text-sm font-semibold text-(--ui-text-highlighted)">
            {{ navbarState.title }}
          </h1>
          <p v-if="navbarState.subtitle" class="truncate text-xs text-(--ui-text-muted)">
            {{ navbarState.subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Right: action buttons + utilities + avatar (desktop only) -->
    <div class="hidden shrink-0 items-center gap-2 lg:flex">
      <!-- Page-specific action buttons injected by each page -->
      <div id="navbar-actions" class="flex items-center gap-2" />

      <!-- Upgrade (free plan only) -->
      <ClientOnly>
        <UButton
          v-if="isFree"
          size="md"
          variant="soft"
          icon="i-lucide-zap"
          to="/pricing"
        >
          {{ t('Upgrade') }}
        </UButton>
      </ClientOnly>

      <!-- Separator -->
      <div class="h-5 w-px bg-(--ui-border)" />

      <!-- Theme toggle -->
      <ThemeSwitcher size="sm" />

      <!-- Notifications -->
      <UTooltip :text="t('Notifications — coming soon')">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-bell"
          square
          aria-label="Notifications"
          disabled
        />
      </UTooltip>

      <!-- Settings -->
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-lucide-settings"
        square
        :aria-label="t('Settings')"
        to="/account/settings"
      />

      <!-- Profile avatar -->
      <NuxtLink to="/account" :aria-label="t('Your account')">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-(--ui-primary)/15 text-sm font-semibold text-(--ui-primary) transition-opacity hover:opacity-80">
          {{ userInitial }}
        </div>
      </NuxtLink>
    </div>
  </header>

  <!-- Mobile-only minimal bar when navbar is hidden (e.g. during scan) -->
  <div
    v-if="navbarState.hidden"
    class="flex h-12 shrink-0 items-center border-b border-(--ui-border) bg-(--ui-bg) px-4 lg:hidden"
  >
    <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-menu" square @click="$emit('toggle-mobile')" />
    <NuxtLink to="/dashboard" class="ml-2 text-sm font-bold text-(--ui-text-highlighted)">
      PawByTech
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from '~/components/ThemeSwitcher.vue'

defineEmits<{
  'toggle-mobile': []
}>()

const router = useRouter()
const authStore = useAuthStore()
const { navbarState } = usePageNavbar()
const { isFree } = usePlan()
const { t } = useI18n()

const mainScrollY = inject<Ref<number>>('mainScrollY', ref(0))
const hasScrolled = computed(() => mainScrollY.value > 8)

const userInitial = computed(() => (authStore.user?.name ?? '').charAt(0).toUpperCase())

function handleBack(): void {
  if (navbarState.backTo) {
    navigateTo(navbarState.backTo)
    return
  }

  router.back()
}
</script>
