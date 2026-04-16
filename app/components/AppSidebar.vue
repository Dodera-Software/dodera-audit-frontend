<template>
  <aside
    data-tutorial="sidebar"
    class="relative flex flex-shrink-0 flex-col overflow-hidden border-r border-(--ui-border-accented) bg-white transition-[width] duration-200 ease-in-out dark:bg-zinc-900"
    :class="[mobile ? 'h-full w-56' : 'hidden lg:flex', !mobile && isCollapsed ? 'border-r-0' : '']"
    :style="mobile ? undefined : { width: isCollapsed ? '0px' : `${sidebarWidth}px` }"
  >
    <!-- Logo -->
    <div
      class="flex h-14 shrink-0 items-center transition-all duration-200"
      :class="isTextVisible ? 'gap-1 px-5' : 'justify-center px-2'"
    >
      <NuxtLink
        to="/dashboard"
        class="flex min-w-0 items-center hover:opacity-80"
        :class="isTextVisible ? 'flex-1 gap-2.5' : 'justify-center'"
        @click="$emit('navigate')"
      >
        <img src="~/assets/logo/pawbytech-logo.png" alt="PawByTech" class="h-10 w-auto shrink-0" />
        <span
          v-if="isTextVisible"
          class="truncate text-lg font-bold text-(--ui-text-highlighted)"
        >PawByTech</span>
      </NuxtLink>
      <UButton
        v-if="!mobile && isTextVisible"
        icon="i-lucide-panel-left-close"
        variant="ghost"
        color="neutral"
        size="sm"
        square
        :aria-label="t('Collapse sidebar')"
        @click="toggle"
      />
    </div>

    <!-- Team switcher -->
    <SidebarTeamSwitcher @navigate="$emit('navigate')" />

    <!-- Context header (admin / project / page) -->
    <SidebarContextHeader ref="contextRef" @navigate="$emit('navigate')" />

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 pt-3">
      <!-- Global shortcuts when inside a project/page context -->
      <template v-if="projectId || isAdminRoute">
        <UButton
          to="/dashboard"
          icon="i-lucide-home"
          variant="ghost"
          color="neutral"
          size="md"
          block
          class="justify-start"
          @click="$emit('navigate')"
        >
          {{ t('Dashboard') }}
        </UButton>
        <USeparator class="my-2" />
      </template>

      <div class="space-y-1">
        <UButton
          v-for="item in activeNavItems"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          :variant="isActive(item.to) ? 'soft' : 'ghost'"
          :color="isActive(item.to) ? 'primary' : 'neutral'"
          :data-tutorial="navTutorialId(item.to)"
          size="md"
          block
          class="justify-start"
          @click="$emit('navigate')"
        >
          {{ item.label }}
        </UButton>
      </div>
    </nav>

    <!-- Upgrade CTA (hidden for Max users and team members) -->
    <div v-if="canUpgrade" class="px-3 pb-2">
      <UButton
        to="/pricing"
        icon="i-lucide-zap"
        color="primary"
        variant="soft"
        size="md"
        block
        class="justify-center"
        @click="$emit('navigate')"
      >
        {{ t('Upgrade') }}
      </UButton>
    </div>

    <!-- User menu -->
    <SidebarUserMenu @navigate="$emit('navigate')" @logout="$emit('logout')" />
  </aside>
</template>

<script setup lang="ts">
import { isAdmin } from '~/constants/roles'

defineProps<{
  mobile?: boolean
}>()

defineEmits<{
  navigate: []
  logout: []
}>()

const { isCollapsed, sidebarWidth, isTextVisible, toggle, startResize } = useSidebarState()

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const { isFree, isMax } = usePlan()
const { activeWorkspace } = useWorkspace()

const user = computed(() => authStore.user)

const canUpgrade = computed(() => !isMax.value && activeWorkspace.value?.role !== 'member')

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
  { to: '/admin/ai', icon: 'i-lucide-brain', label: t('AI Agents') },
  { to: '/admin/audits', icon: 'i-lucide-scan-search', label: t('Audits') },
  { to: '/admin/issues', icon: 'i-lucide-bug', label: t('Issues') },
  { to: '/admin/pages', icon: 'i-lucide-globe', label: t('Pages') },
  { to: '/admin/teams', icon: 'i-lucide-users-round', label: t('Teams') },
  { to: '/admin/system', icon: 'i-lucide-server', label: t('System') },
  { to: '/admin/activity', icon: 'i-lucide-scroll-text', label: t('Activity') },
])

const globalNavItems = computed(() => {
  const items: { to: string, icon: string, label: string }[] = []
  if (isAdmin(user.value?.role)) {
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

function navTutorialId(to: string): string | undefined {
  const map: Record<string, string> = {
    '/dashboard': 'nav-dashboard',
    '/projects': 'nav-projects',
  }
  return map[to]
}

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
