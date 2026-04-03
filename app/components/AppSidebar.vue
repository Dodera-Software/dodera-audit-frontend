<template>
  <aside
    class="flex w-56 flex-shrink-0 flex-col border-r border-(--ui-border-accented) bg-white dark:bg-zinc-900"
    :class="mobile ? 'h-full' : 'hidden lg:flex'"
  >
    <!-- Logo -->
    <div class="flex h-14 items-center px-5">
      <NuxtLink to="/dashboard" class="flex items-center gap-2.5 hover:opacity-80" @click="$emit('navigate')">
        <img src="~/assets/logo/pawbytech-logo.png" alt="PawByTech" class="h-10 w-auto" />
        <span class="hidden text-lg font-bold text-(--ui-text-highlighted) sm:block">PawByTech</span>
      </NuxtLink>
    </div>

    <!-- Team switcher -->
    <SidebarTeamSwitcher @navigate="$emit('navigate')" />

    <!-- Context header (admin / project / page) -->
    <SidebarContextHeader ref="contextRef" @navigate="$emit('navigate')" />

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 pt-3">
      <UButton
        v-for="item in activeNavItems"
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

    <!-- Upgrade CTA for free users -->
    <div v-if="isFree" class="px-3 pb-2">
      <NuxtLink
        to="/pricing"
        class="flex items-center gap-2.5 rounded-xl border border-(--ui-primary)/25 bg-(--ui-primary)/8 px-3 py-2.5 transition-colors hover:bg-(--ui-primary)/15"
        @click="$emit('navigate')"
      >
        <UIcon name="i-lucide-zap" class="h-4 w-4 shrink-0 text-(--ui-primary)" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-(--ui-primary)">{{ t('Upgrade plan') }}</p>
          <p class="truncate text-[10px] text-(--ui-text-dimmed)">{{ t('Unlock full access') }}</p>
        </div>
      </NuxtLink>
    </div>

    <!-- User menu -->
    <SidebarUserMenu @navigate="$emit('navigate')" @logout="$emit('logout')" />
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
const authStore = useAuthStore()
const { isFree } = usePlan()

const user = computed(() => authStore.user)

const contextRef = ref<{ projectId: string | null, pageId: string | null, isAdmin: boolean }>()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const projectId = computed(() => contextRef.value?.projectId ?? null)
const pageId = computed(() => contextRef.value?.pageId ?? null)

// Navigation items
const adminNavItems = computed(() => [
  { to: '/admin', icon: 'i-lucide-layout-dashboard', label: t('Overview') },
  { to: '/admin/users', icon: 'i-lucide-users', label: t('Users') },
  { to: '/admin/analytics', icon: 'i-lucide-bar-chart-3', label: t('Analytics') },
  { to: '/admin/revenue', icon: 'i-lucide-credit-card', label: t('Revenue') },
  { to: '/admin/audits', icon: 'i-lucide-scan-search', label: t('Audits') },
  { to: '/admin/issues', icon: 'i-lucide-bug', label: t('Issues') },
  { to: '/admin/pages', icon: 'i-lucide-globe', label: t('Pages') },
  { to: '/admin/teams', icon: 'i-lucide-users-round', label: t('Teams') },
  { to: '/admin/system', icon: 'i-lucide-server', label: t('System') },
  { to: '/admin/activity', icon: 'i-lucide-scroll-text', label: t('Activity') },
])

const globalNavItems = computed(() => {
  const items: { to: string, icon: string, label: string }[] = []
  if (user.value?.is_admin) {
    items.push({ to: '/admin', icon: 'i-lucide-shield', label: t('Admin') })
  }
  items.push(
    { to: '/dashboard', icon: 'i-lucide-home', label: t('Dashboard') },
    { to: '/projects', icon: 'i-lucide-folder', label: t('Projects') },
  )
  return items
})

const projectFolderNavItems = computed(() => {
  if (!projectId.value) return []
  return [
    { to: `/projects/${projectId.value}`, icon: 'i-lucide-layout-grid', label: t('Pages') },
  ]
})

const pageNavItems = computed(() => {
  if (!projectId.value || !pageId.value) return []
  const base = `/projects/${projectId.value}/pages/${pageId.value}`
  return [
    { to: base, icon: 'i-lucide-layout-dashboard', label: t('Overview') },
    { to: `${base}/board`, icon: 'i-lucide-kanban', label: t('Issue board') },
    { to: `${base}/history`, icon: 'i-lucide-history', label: t('Audit history') },
  ]
})

const activeNavItems = computed(() => {
  if (isAdminRoute.value) return adminNavItems.value
  if (pageId.value) return pageNavItems.value
  if (projectId.value) return projectFolderNavItems.value
  return globalNavItems.value
})

function isActive(path: string): boolean {
  if (path === '/dashboard') return route.path === '/dashboard'
  if (path === '/projects') return route.path === '/projects' || route.path === '/projects/'
  if (path === '/admin') return route.path === '/admin' || route.path === '/admin/'
  if (isAdminRoute.value && path.startsWith('/admin/')) {
    return route.path === path || route.path.startsWith(`${path}/`)
  }
  if (pageId.value && path === `/projects/${projectId.value}/pages/${pageId.value}`) {
    return route.path === path || route.path === `${path}/`
  }
  if (!pageId.value && projectId.value && path === `/projects/${projectId.value}`) {
    return route.path === path || route.path === `${path}/`
  }
  return route.path.startsWith(path)
}
</script>
