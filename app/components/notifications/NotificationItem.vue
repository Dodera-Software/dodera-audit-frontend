<template>
  <div
    role="button"
    tabindex="0"
    class="group relative flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-(--ui-bg-muted) focus:bg-(--ui-bg-muted) focus:outline-none"
    :class="{ 'bg-(--ui-primary)/5': !notification.read_at }"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div
      class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      :class="meta.iconBgClass"
    >
      <UIcon :name="notification.icon ?? meta.defaultIcon" class="h-3.5 w-3.5" :class="meta.iconColorClass" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="truncate text-sm font-medium text-(--ui-text-highlighted)">
          {{ notification.title ?? t('Notification') }}
        </p>
        <span
          v-if="!notification.read_at"
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-(--ui-primary)"
          :aria-label="t('Unread')"
        />
      </div>
      <p v-if="notification.body" class="mt-0.5 line-clamp-3 text-xs text-(--ui-text-muted)">
        {{ notification.body }}
      </p>

      <div v-if="notification.link" class="mt-1.5">
        <component
          :is="isExternal ? 'a' : resolveNuxtLink()"
          :to="isExternal ? undefined : notification.link"
          :href="isExternal ? notification.link : undefined"
          :target="isExternal ? '_blank' : undefined"
          :rel="isExternal ? 'noopener noreferrer' : undefined"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-(--ui-primary) hover:underline"
          @click.stop="emit('linkClick', notification)"
        >
          <UIcon name="i-lucide-external-link" class="h-3 w-3" />
          {{ linkLabel }}
        </component>
      </div>

      <p class="mt-1 text-[11px] text-(--ui-text-dimmed)">
        {{ relativeTime }}
      </p>
    </div>

    <UButton
      variant="ghost"
      color="neutral"
      size="xs"
      icon="i-lucide-x"
      square
      class="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      :aria-label="t('Dismiss')"
      @click.stop="emit('remove', notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import type { AppNotification } from '~/stores/notifications'
import { notificationTypeMeta } from '~/constants/notifications'

const props = defineProps<{
  notification: AppNotification
}>()

const emit = defineEmits<{
  click: [notification: AppNotification]
  linkClick: [notification: AppNotification]
  remove: [id: string]
}>()

const { t } = useI18n()

const meta = computed(() => notificationTypeMeta(props.notification.type))
const relativeTime = computed(() => formatRelative(props.notification.created_at))

const isExternal = computed(() => {
  const link = props.notification.link ?? ''
  return /^https?:\/\//i.test(link)
})

const linkLabel = computed(() => {
  const link = props.notification.link ?? ''
  if (isExternal.value) {
    try {
      return new URL(link).hostname
    }
    catch {
      return t('Open')
    }
  }
  return t('Open')
})

function resolveNuxtLink() {
  // Resolved at runtime so SSR/hydration pick up the registered component.
  return resolveComponent('NuxtLink')
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return t('just now')
  if (mins < 60) return t('{n}m ago', { n: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('{n}h ago', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('{n}d ago', { n: days })
  return date.toLocaleDateString()
}

function handleClick() {
  emit('click', props.notification)
}
</script>
