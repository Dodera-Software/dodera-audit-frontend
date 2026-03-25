<template>
  <aside
    class="flex w-56 flex-shrink-0 flex-col border-r border-(--ui-border-accented) bg-white dark:bg-zinc-900"
    :class="mobile ? 'h-full' : 'hidden lg:flex'"
  >
    <!-- Logo -->
    <div class="flex h-14 items-center px-5">
      <NuxtLink to="/dashboard" class="flex items-center gap-2.5 hover:opacity-80" @click="$emit('navigate')">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-(--ui-primary) text-xs font-bold text-white">
          G
        </div>
        <span class="font-display text-base font-bold text-(--ui-text-highlighted)">GhostAudit</span>
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 pt-2">
      <UButton
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :icon="item.icon"
        :variant="isActive(item.to) ? 'soft' : 'ghost'"
        :color="isActive(item.to) ? 'primary' : 'neutral'"
        size="md"
        block
        class="justify-start"
        @click="$emit('navigate')"
      >
        {{ item.label }}
      </UButton>
    </nav>

    <!-- User section -->
    <div class="border-t border-(--ui-border-accented) p-3">
      <UPopover :ui="{ content: 'w-52' }">
        <UButton variant="ghost" color="neutral" size="md" block class="justify-start">
          <template #leading>
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-(--ui-primary)/15 text-[11px] font-semibold text-(--ui-primary)">
              {{ userInitial }}
            </div>
          </template>
          <span class="flex-1 truncate text-left text-sm">{{ user?.name ?? '' }}</span>
          <template #trailing>
            <UIcon name="i-lucide-chevrons-up-down" class="h-3.5 w-3.5 opacity-40" />
          </template>
        </UButton>

        <template #content>
          <div class="p-1.5">
            <!-- User info -->
            <div class="px-2.5 py-2">
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ user?.name }}</p>
              <p class="text-xs text-(--ui-text-dimmed)">{{ user?.email }}</p>
            </div>

            <USeparator class="my-1" />

            <!-- Menu items -->
            <UButton
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              :icon="item.icon"
              variant="ghost"
              color="neutral"
              size="sm"
              block
              class="justify-start"
              @click="$emit('navigate')"
            >
              {{ item.label }}
            </UButton>

            <USeparator class="my-1" />

            <!-- Theme -->
            <div class="flex items-center justify-between px-2.5 py-2">
              <span class="text-xs text-(--ui-text-muted)">{{ t('Theme') }}</span>
              <div class="flex gap-0.5">
                <UButton
                  v-for="mode in themeModes"
                  :key="mode.value"
                  :icon="mode.icon"
                  :variant="colorMode.preference === mode.value ? 'soft' : 'ghost'"
                  :color="colorMode.preference === mode.value ? 'primary' : 'neutral'"
                  size="xs"
                  square
                  @click="colorMode.preference = mode.value"
                />
              </div>
            </div>

            <USeparator class="my-1" />

            <!-- Logout -->
            <UButton
              icon="i-lucide-log-out"
              variant="ghost"
              color="error"
              size="sm"
              block
              class="justify-start"
              @click="$emit('logout')"
            >
              {{ t('Logout') }}
            </UButton>
          </div>
        </template>
      </UPopover>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  mobile?: boolean
}>()

defineEmits<{
  navigate: []
  logout: []
}>()

const { t } = useI18n()
const route = useRoute()
const colorMode = useColorMode()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userInitial = computed(() => (user.value?.name ?? '').charAt(0).toUpperCase())

const navItems = computed(() => [
  { to: '/dashboard', icon: 'i-lucide-home', label: t('Dashboard') },
  { to: '/projects', icon: 'i-lucide-folder', label: t('Projects') },
])

const menuItems = computed(() => [
  { to: '/account', icon: 'i-lucide-user', label: t('Profile') },
  { to: '/account/settings', icon: 'i-lucide-settings', label: t('Settings') },
])

const themeModes = [
  { value: 'light', icon: 'i-lucide-sun' },
  { value: 'dark', icon: 'i-lucide-moon' },
  { value: 'system', icon: 'i-lucide-monitor' },
]

function isActive(path: string): boolean {
  if (path === '/dashboard') return route.path === '/dashboard'
  if (path === '/projects') return route.path.startsWith('/projects')
  return route.path.startsWith(path)
}
</script>
