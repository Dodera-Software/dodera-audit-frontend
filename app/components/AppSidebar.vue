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
    <div class="border-b border-(--ui-border-accented) px-3 pb-3">
      <UPopover v-model:open="teamPopoverOpen" :ui="{ content: 'w-60' }">
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          block
          class="justify-start"
          :loading="switching"
        >
          <template #leading>
            <UIcon
              :name="activeWorkspace?.type === 'team' ? 'i-lucide-users' : 'i-lucide-building-2'"
              class="h-4 w-4 shrink-0 text-(--ui-primary)"
            />
          </template>
          <div class="flex min-w-0 flex-1 flex-col items-start">
            <span class="truncate text-left text-xs font-semibold leading-tight text-(--ui-text-highlighted)">
              {{ activeWorkspace?.name ?? t("My Team") }}
            </span>
            <span v-if="activeWorkspace?.type === 'team'" class="truncate text-left text-[10px] leading-tight text-(--ui-text-dimmed)">
              {{ t("owned by {name}", { name: activeWorkspace.owner_name }) }}
            </span>
          </div>
          <template #trailing>
            <UIcon name="i-lucide-chevrons-up-down" class="h-3 w-3 opacity-40" />
          </template>
        </UButton>

        <template #content>
          <div class="p-1.5">
            <p class="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-(--ui-text-dimmed)">
              {{ t('Teams') }}
            </p>

            <div
              v-for="ws in workspaces"
              :key="ws.id"
              class="group flex items-center gap-1 rounded-md px-1"
              :class="ws.is_active ? 'bg-(--ui-bg-elevated)' : ''"
            >
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                class="flex-1 justify-start"
                :disabled="ws.is_active || switching"
                @click="onSwitchTeam(ws.id)"
              >
                <template #leading>
                  <UIcon
                    :name="ws.type === 'team' ? 'i-lucide-users' : 'i-lucide-building-2'"
                    class="h-3.5 w-3.5 shrink-0"
                    :class="ws.is_active ? 'text-(--ui-primary)' : 'text-(--ui-text-muted)'"
                  />
                </template>
                <div class="flex min-w-0 flex-1 flex-col items-start">
                  <span class="truncate text-xs font-medium leading-tight">{{ ws.name }}</span>
                  <span v-if="ws.type === 'team'" class="truncate text-[10px] leading-tight text-(--ui-text-dimmed)">{{ ws.owner_name }}</span>
                </div>
                <UIcon v-if="ws.is_active" name="i-lucide-check" class="h-3.5 w-3.5 shrink-0 text-(--ui-primary)" />
              </UButton>

              <UButton
                v-if="ws.type === 'team' && ws.role === 'member'"
                variant="ghost"
                color="error"
                size="xs"
                square
                :loading="leaving === ws.id"
                class="shrink-0 opacity-0 group-hover:opacity-100"
                :title="t('Leave team')"
                @click="onLeaveTeam(ws)"
              >
                <UIcon name="i-lucide-log-out" class="h-3.5 w-3.5" />
              </UButton>
            </div>

            <USeparator class="my-1.5" />

            <UButton
              v-if="user?.team_role === 'owner'"
              icon="i-lucide-settings"
              variant="ghost"
              color="neutral"
              size="sm"
              block
              class="justify-start"
              to="/account/team"
              @click="teamPopoverOpen = false; $emit('navigate')"
            >
              {{ t('Manage team') }}
            </UButton>

            <UButton
              v-if="user?.team_role !== 'owner'"
              icon="i-lucide-plus"
              variant="ghost"
              color="neutral"
              size="sm"
              block
              class="justify-start"
              to="/account/team"
              @click="teamPopoverOpen = false; $emit('navigate')"
            >
              {{ t('Create a team') }}
            </UButton>

            <UButton
              v-if="user?.team_role === 'owner'"
              icon="i-lucide-user-plus"
              variant="ghost"
              color="neutral"
              size="sm"
              block
              class="justify-start"
              to="/account/team"
              @click="teamPopoverOpen = false; $emit('navigate')"
            >
              {{ t('Invite members') }}
            </UButton>
          </div>
        </template>
      </UPopover>
    </div>

    <!-- Project/Page context header -->
    <div v-if="projectId" class="border-b border-(--ui-border) px-3 py-2">
      <template v-if="pageId">
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          :to="`/projects/${projectId}`"
          class="mb-1"
          @click="$emit('navigate')"
        >
          {{ projectName || t('Back to project') }}
        </UButton>
        <div class="flex items-center gap-2 px-2">
          <img
            v-if="pageUrl"
            :src="`https://www.google.com/s2/favicons?domain=${pageUrl.replace(/^https?:\/\//, '').split('/')[0]}&sz=32`"
            class="h-5 w-5 rounded"
            loading="lazy"
          >
          <span class="truncate text-sm font-semibold text-(--ui-text-highlighted)">{{ pageName }}</span>
        </div>
      </template>
      <template v-else>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          to="/projects"
          class="mb-1"
          @click="$emit('navigate')"
        >
          {{ t('All projects') }}
        </UButton>
        <div class="flex items-center gap-2 px-2">
          <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-(--ui-primary)/10">
            <UIcon name="i-lucide-folder" class="h-3.5 w-3.5 text-(--ui-primary)" />
          </div>
          <span class="truncate text-sm font-semibold text-(--ui-text-highlighted)">{{ projectName }}</span>
        </div>
      </template>
    </div>

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

    <!-- User section -->
    <div class="border-t border-(--ui-border-accented) p-3">
      <UPopover :ui="{ content: 'w-52' }">
        <UButton variant="ghost" color="neutral" size="md" block class="justify-start">
          <template #leading>
            <div class="relative">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-(--ui-primary)/15 text-[11px] font-semibold text-(--ui-primary)">
                {{ userInitial }}
              </div>
              <span v-if="!authStore.isEmailVerified" class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-white dark:ring-zinc-900" />
            </div>
          </template>
          <span class="flex-1 truncate text-left text-sm">{{ user?.name ?? '' }}</span>
          <template #trailing>
            <UIcon name="i-lucide-chevrons-up-down" class="h-3.5 w-3.5 opacity-40" />
          </template>
        </UButton>

        <template #content>
          <div class="p-1.5">
            <div class="px-2.5 py-2">
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ user?.name }}</p>
              <p class="text-xs text-(--ui-text-dimmed)">{{ user?.email }}</p>
            </div>

            <div v-if="!authStore.isEmailVerified" class="mx-1.5 mb-1 flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1.5 dark:bg-amber-950/40">
              <UIcon name="i-lucide-mail-warning" class="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <p class="flex-1 truncate text-xs text-amber-700 dark:text-amber-300">{{ t('Email not verified') }}</p>
              <NuxtLink to="/account" class="text-[10px] font-medium text-amber-600 underline hover:text-amber-800 dark:text-amber-400" @click="$emit('navigate')">
                {{ t('Verify') }}
              </NuxtLink>
            </div>

            <USeparator class="my-1" />

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
const { isFree } = usePlan()
const { $api } = useApi()

const user = computed(() => authStore.user)

// Team switcher
const { workspaces, activeWorkspace, switching, leaving, fetchWorkspaces, switchWorkspace, leaveWorkspace } = useWorkspace()
const teamPopoverOpen = ref(false)
const { confirm } = useConfirm()

async function onSwitchTeam(id: string) {
  teamPopoverOpen.value = false
  await switchWorkspace(id)
}

async function onLeaveTeam(ws: { id: string, team_id?: string, name: string }) {
  if (!ws.team_id) return
  teamPopoverOpen.value = false
  const ok = await confirm({
    title: t('Leave {name}?', { name: ws.name }),
    description: t('You will lose access to this team\'s data.'),
    confirmLabel: t('Leave'),
    color: 'error',
  })
  if (!ok) return
  await leaveWorkspace(ws.team_id, ws.id)
}

onMounted(() => {
  fetchWorkspaces()
})

const userInitial = computed(() => (user.value?.name ?? '').charAt(0).toUpperCase())

// Detect route context
const projectId = computed(() => {
  const match = route.path.match(/^\/projects\/([^/]+)/)
  return match?.[1] ?? null
})

const pageId = computed(() => {
  const match = route.path.match(/^\/projects\/[^/]+\/pages\/([^/]+)/)
  return match?.[1] ?? null
})

// Context info for sidebar header
const projectName = ref('')
const pageName = ref('')
const pageUrl = ref('')

watch(projectId, async (id) => {
  if (!id) {
    projectName.value = ''
    return
  }
  try {
    const data = await $api<{ data: { name: string } }>(`/projects/${id}`)
    projectName.value = data.data.name
  }
  catch {
    projectName.value = ''
  }
}, { immediate: true })

watch(pageId, async (id) => {
  if (!id) {
    pageName.value = ''
    pageUrl.value = ''
    return
  }
  try {
    const data = await $api<{ data: { name: string | null, url: string } }>(`/pages/${id}`)
    pageUrl.value = data.data.url
    pageName.value = data.data.name || new URL(data.data.url).hostname
  }
  catch {
    pageName.value = ''
    pageUrl.value = ''
  }
}, { immediate: true })

// Global nav items
const globalNavItems = computed(() => [
  { to: '/dashboard', icon: 'i-lucide-home', label: t('Dashboard') },
  { to: '/projects', icon: 'i-lucide-folder', label: t('Projects') },
])

// Project folder nav
const projectFolderNavItems = computed(() => {
  if (!projectId.value) return []
  return [
    { to: `/projects/${projectId.value}`, icon: 'i-lucide-layout-grid', label: t('Pages') },
  ]
})

// Page-level nav items
const pageNavItems = computed(() => {
  if (!projectId.value || !pageId.value) return []
  const base = `/projects/${projectId.value}/pages/${pageId.value}`
  return [
    { to: base, icon: 'i-lucide-layout-dashboard', label: t('Overview') },
    { to: `${base}/board`, icon: 'i-lucide-kanban', label: t('Issue board') },
    { to: `${base}/history`, icon: 'i-lucide-history', label: t('Audit history') },
  ]
})

// Which nav to show
const activeNavItems = computed(() => {
  if (pageId.value) return pageNavItems.value
  if (projectId.value) return projectFolderNavItems.value
  return globalNavItems.value
})

const menuItems = computed(() => [
  { to: '/account', icon: 'i-lucide-user', label: t('Profile') },
  { to: '/account/billing', icon: 'i-lucide-credit-card', label: t('Billing & Plan') },
  { to: '/account/team', icon: 'i-lucide-users', label: t('Team') },
  { to: '/account/settings', icon: 'i-lucide-settings', label: t('Settings') },
])

const themeModes = [
  { value: 'light', icon: 'i-lucide-sun' },
  { value: 'dark', icon: 'i-lucide-moon' },
  { value: 'system', icon: 'i-lucide-monitor' },
]

function isActive(path: string): boolean {
  if (path === '/dashboard') return route.path === '/dashboard'
  if (path === '/projects') return route.path === '/projects' || route.path === '/projects/'
  if (pageId.value && path === `/projects/${projectId.value}/pages/${pageId.value}`) {
    return route.path === path || route.path === `${path}/`
  }
  if (!pageId.value && projectId.value && path === `/projects/${projectId.value}`) {
    return route.path === path || route.path === `${path}/`
  }
  return route.path.startsWith(path)
}
</script>
