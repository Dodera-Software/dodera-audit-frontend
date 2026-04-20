<template>
  <UPopover v-model:open="open" :ui="{ content: 'w-[400px] max-w-[calc(100vw-2rem)]' }">
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      icon="i-lucide-bell"
      square
      class="relative"
      :aria-label="t('Notifications')"
    >
      <span
        v-if="unreadCount > 0"
        class="pointer-events-none absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-(--ui-primary) px-1 text-[9px] font-semibold leading-none text-(--ui-primary-contrast) ring-2 ring-(--ui-bg)"
        :aria-label="t('{n} unread', { n: unreadCount })"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </UButton>

    <template #content>
      <div class="flex items-center justify-between border-b border-(--ui-border) px-3 py-2">
        <div class="flex items-center gap-2">
          <p class="text-sm font-semibold text-(--ui-text-highlighted)">
            {{ t('Notifications') }}
          </p>
          <span v-if="unreadCount > 0" class="rounded-full bg-(--ui-primary)/10 px-1.5 py-0.5 text-[10px] font-medium text-(--ui-primary)">
            {{ unreadCount }} {{ t('new') }}
          </span>
        </div>
        <UButton
          v-if="unreadCount > 0"
          variant="ghost"
          color="neutral"
          size="xs"
          @click="notificationsStore.markAllRead()"
        >
          {{ t('Mark all read') }}
        </UButton>
      </div>

      <div
        ref="listRef"
        class="max-h-[60vh] min-h-[120px] overflow-y-auto py-1"
        @scroll.passive="onScroll"
      >
        <div v-if="loading && items.length === 0" class="flex items-center justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin text-(--ui-text-muted)" />
        </div>

        <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-(--ui-bg-muted)">
            <UIcon name="i-lucide-bell-off" class="h-4 w-4 text-(--ui-text-muted)" />
          </div>
          <p class="text-sm font-medium text-(--ui-text-highlighted)">
            {{ t('No notifications yet') }}
          </p>
          <p class="text-xs text-(--ui-text-muted)">
            {{ t('You will see updates about audits, team activity and more here.') }}
          </p>
        </div>

        <div v-else class="px-1">
          <NotificationItem
            v-for="item in items"
            :key="item.id"
            :notification="item"
            @click="onItemClick"
            @link-click="onLinkClick"
            @remove="notificationsStore.remove($event)"
          />

          <div v-if="notificationsStore.hasMore" class="flex justify-center py-2">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              :loading="loading"
              @click="notificationsStore.fetchNextPage()"
            >
              {{ t('Load more') }}
            </UButton>
          </div>

          <div v-else-if="items.length > 0" class="py-2 text-center text-[11px] text-(--ui-text-dimmed)">
            {{ t("You're all caught up") }}
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { AppNotification } from '~/stores/notifications'
import NotificationItem from '~/components/notifications/NotificationItem.vue'

const { t } = useI18n()
const notificationsStore = useNotificationsStore()
const { items, unreadCount, loading } = storeToRefs(notificationsStore)

const open = ref(false)
const listRef = ref<HTMLElement | null>(null)

watch(open, (isOpen) => {
  if (isOpen) {
    notificationsStore.fetchFirstPage()
    if (notificationsStore.unreadCount > 0) {
      notificationsStore.markAllRead()
    }
  }
})

function onItemClick(notification: AppNotification) {
  // Mark read but keep the popover open — the user stays inside the list.
  if (!notification.read_at) {
    notificationsStore.markRead(notification.id)
  }
}

async function onLinkClick(notification: AppNotification) {
  if (!notification.read_at) {
    notificationsStore.markRead(notification.id)
  }
  // External links are handled by the anchor element itself.
  // Internal links: the NuxtLink already navigates; just close the popover.
  open.value = false
}

function onScroll(event: Event) {
  if (!notificationsStore.hasMore || loading.value) return
  const el = event.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
    notificationsStore.fetchNextPage()
  }
}
</script>
