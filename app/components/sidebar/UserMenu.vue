<template>
  <div class="border-t border-(--ui-border-accented) p-3">
    <UPopover v-model:open="popoverOpen" :ui="{ content: 'w-52' }">
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

          <!-- Admin link (admin users only) -->
          <template v-if="authStore.user?.is_admin">
            <USeparator class="my-1" />
            <UButton
              to="/admin"
              icon="i-lucide-shield"
              variant="ghost"
              color="neutral"
              size="sm"
              block
              class="justify-start"
              @click="$emit('navigate')"
            >
              {{ t('Admin dashboard') }}
            </UButton>
          </template>

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

          <UiTutorialTriggerButton block @click="popoverOpen = false" />

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
</template>

<script setup lang="ts">
defineEmits<{
  navigate: []
  logout: []
}>()

const { t } = useI18n()
const colorMode = useColorMode()
const authStore = useAuthStore()
const popoverOpen = ref(false)

const user = computed(() => authStore.user)
const userInitial = computed(() => (user.value?.name ?? '').charAt(0).toUpperCase())

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
</script>
