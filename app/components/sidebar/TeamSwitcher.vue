<template>
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
</template>

<script setup lang="ts">
defineEmits<{
  navigate: []
}>()

const { t } = useI18n()
const authStore = useAuthStore()
const { confirm } = useConfirm()
const { workspaces, activeWorkspace, switching, leaving, fetchWorkspaces, switchWorkspace, leaveWorkspace } = useWorkspace()

const user = computed(() => authStore.user)
const teamPopoverOpen = ref(false)

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
</script>
