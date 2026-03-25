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

    <!-- Project context header (when inside a project) -->
    <div v-if="projectId" class="border-b border-(--ui-border) px-3 pb-3">
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-lucide-arrow-left"
        to="/projects"
        class="mb-2"
        @click="$emit('navigate')"
      >
        {{ t('All projects') }}
      </UButton>
      <div class="flex items-center gap-2 px-2">
        <img
          v-if="projectUrl"
          :src="`https://www.google.com/s2/favicons?domain=${projectUrl.replace(/^https?:\/\//, '').split('/')[0]}&sz=32`"
          class="h-5 w-5 rounded"
          loading="lazy"
        >
        <span class="truncate text-sm font-semibold text-(--ui-text-highlighted)">{{ projectName }}</span>
      </div>
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
            <div class="px-2.5 py-2">
              <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ user?.name }}</p>
              <p class="text-xs text-(--ui-text-dimmed)">{{ user?.email }}</p>
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
const { $api } = useApi()

const user = computed(() => authStore.user)
const userInitial = computed(() => (user.value?.name ?? '').charAt(0).toUpperCase())

// Detect if we're inside a project
const projectId = computed(() => {
  const match = route.path.match(/^\/projects\/([^/]+)/)
  return match?.[1] ?? null
})

// Project info for sidebar header
const projectName = ref('')
const projectUrl = ref('')

watch(projectId, async (id) => {
  if (!id) {
    projectName.value = ''
    projectUrl.value = ''
    return
  }
  try {
    const data = await $api<{ data: { name: string, url: string } }>(`/projects/${id}`)
    projectName.value = data.data.name
    projectUrl.value = data.data.url
  }
  catch {
    projectName.value = ''
    projectUrl.value = ''
  }
}, { immediate: true })

// Global nav items
const globalNavItems = computed(() => [
  { to: '/dashboard', icon: 'i-lucide-home', label: t('Dashboard') },
  { to: '/projects', icon: 'i-lucide-folder', label: t('Projects') },
])

// Project-specific nav items
const projectNavItems = computed(() => {
  if (!projectId.value) return []
  const base = `/projects/${projectId.value}`
  return [
    { to: base, icon: 'i-lucide-layout-dashboard', label: t('Overview') },
    { to: `${base}/board`, icon: 'i-lucide-kanban', label: t('Issue board') },
    { to: `${base}/history`, icon: 'i-lucide-history', label: t('Audit history') },
  ]
})

// Which nav to show
const activeNavItems = computed(() => projectId.value ? projectNavItems.value : globalNavItems.value)

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
  // Exact match for project overview
  if (projectId.value && path === `/projects/${projectId.value}`) {
    return route.path === path || route.path === `${path}/`
  }
  if (path === '/dashboard') return route.path === '/dashboard'
  if (path === '/projects') return route.path === '/projects' || route.path === '/projects/'
  return route.path.startsWith(path)
}
</script>
