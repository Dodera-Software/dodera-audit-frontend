<template>
  <div class="border-b border-(--ui-border-accented) px-3 pb-3">
    <UPopover v-model:open="teamPopoverOpen" :ui="{ content: 'w-64' }">
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
            :name="activeWorkspace?.type === 'member' ? 'i-lucide-users' : 'i-lucide-building-2'"
            class="h-4 w-4 shrink-0 text-(--ui-primary)"
          />
        </template>
        <div class="flex min-w-0 flex-1 flex-col items-start">
          <span class="truncate text-left text-sm font-semibold leading-tight text-(--ui-text-highlighted)">
            {{ activeWorkspace?.name ?? t("My Team") }}
          </span>
          <span v-if="activeWorkspace?.type === 'member'" class="truncate text-left text-xs leading-tight text-(--ui-text-dimmed)">
            {{ t("owned by {name}", { name: activeWorkspace.owner_name }) }}
          </span>
        </div>
        <template #trailing>
          <UIcon name="i-lucide-chevrons-up-down" class="h-3 w-3 opacity-40" />
        </template>
      </UButton>

      <template #content>
        <div class="p-1.5">
          <p v-if="ownedWorkspaces.length" class="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-(--ui-text-dimmed)">
            {{ t('Your teams') }}
          </p>

          <div
            v-for="ws in ownedWorkspaces"
            :key="ws.id"
            class="group flex items-center gap-1 rounded-md px-1"
            :class="ws.is_active ? 'bg-(--ui-bg-elevated)' : ''"
          >
            <div
              v-if="ws.is_active"
              class="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5"
            >
              <UIcon name="i-lucide-building-2" class="h-3.5 w-3.5 shrink-0 text-(--ui-primary)" />
              <span class="flex-1 truncate text-xs font-medium leading-tight text-(--ui-text-highlighted)">{{ ws.name }}</span>
              <UIcon name="i-lucide-check" class="h-3.5 w-3.5 shrink-0 text-(--ui-primary)" />
            </div>

            <UButton
              v-else
              variant="ghost"
              color="neutral"
              size="sm"
              class="flex-1 justify-start"
              :disabled="switching"
              @click="onSwitch(ws.id)"
            >
              <template #leading>
                <UIcon name="i-lucide-building-2" class="h-3.5 w-3.5 shrink-0 text-(--ui-text-muted)" />
              </template>
              <span class="truncate text-xs font-medium leading-tight">{{ ws.name }}</span>
            </UButton>
          </div>

          <p v-if="memberWorkspaces.length" class="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--ui-text-dimmed)">
            {{ t('Shared with you') }}
          </p>

          <div
            v-for="ws in memberWorkspaces"
            :key="ws.id"
            class="group flex items-center gap-1 rounded-md px-1"
            :class="ws.is_active ? 'bg-(--ui-bg-elevated)' : ''"
          >
            <div
              v-if="ws.is_active"
              class="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5"
            >
              <UIcon name="i-lucide-users" class="h-3.5 w-3.5 shrink-0 text-(--ui-primary)" />
              <div class="flex min-w-0 flex-1 flex-col items-start">
                <span class="truncate text-xs font-medium leading-tight text-(--ui-text-highlighted)">{{ ws.name }}</span>
                <span class="truncate text-[10px] leading-tight text-(--ui-text-dimmed)">{{ ws.owner_name }}</span>
              </div>
              <UIcon name="i-lucide-check" class="h-3.5 w-3.5 shrink-0 text-(--ui-primary)" />
            </div>

            <UButton
              v-else
              variant="ghost"
              color="neutral"
              size="sm"
              class="flex-1 justify-start"
              :disabled="switching"
              @click="onSwitch(ws.id)"
            >
              <template #leading>
                <UIcon name="i-lucide-users" class="h-3.5 w-3.5 shrink-0 text-(--ui-text-muted)" />
              </template>
              <div class="flex min-w-0 flex-1 flex-col items-start">
                <span class="truncate text-xs font-medium leading-tight">{{ ws.name }}</span>
                <span class="truncate text-[10px] leading-tight text-(--ui-text-dimmed)">{{ ws.owner_name }}</span>
              </div>
            </UButton>

            <UButton
              variant="ghost"
              color="error"
              size="xs"
              square
              :loading="leaving === ws.id"
              class="shrink-0 opacity-0 group-hover:opacity-100"
              :title="t('Leave team')"
              @click="onLeave(ws)"
            >
              <UIcon name="i-lucide-log-out" class="h-3.5 w-3.5" />
            </UButton>
          </div>

          <USeparator class="my-1.5" />

          <UButton
            icon="i-lucide-plus"
            variant="ghost"
            color="neutral"
            size="sm"
            block
            class="justify-start"
            :disabled="!isPaid"
            @click="onCreateTeam"
          >
            {{ t('Create a team') }}
          </UButton>

          <UButton
            icon="i-lucide-settings"
            variant="ghost"
            color="neutral"
            size="sm"
            block
            class="justify-start"
            to="/account/team"
            @click="teamPopoverOpen = false; $emit('navigate')"
          >
            {{ t('Manage teams') }}
          </UButton>

          <UButton
            v-if="activeWorkspace?.type === 'owned' && isPaid"
            icon="i-lucide-user-plus"
            variant="ghost"
            color="neutral"
            size="sm"
            block
            class="justify-start"
            @click="teamPopoverOpen = false; showInviteDialog = true"
          >
            {{ t('Invite members') }}
          </UButton>
        </div>
      </template>
    </UPopover>

    <SidebarInviteMemberDialog
      v-if="activeWorkspace?.type === 'owned'"
      v-model:open="showInviteDialog"
      :team-id="activeWorkspace.id"
    />

    <UModal v-model:open="showCreateDialog" :ui="{ content: 'max-w-md' }">
      <template #content>
        <div class="flex flex-col px-6 py-5">
          <h2 class="text-base font-semibold">{{ t('Create a new team') }}</h2>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            {{ t('Team members and data are isolated per team, but all teams share your subscription.') }}
          </p>
          <UInput
            v-model="newTeamName"
            :placeholder="t('Team name')"
            class="mt-4"
            size="lg"
            :disabled="creating"
            @keyup.enter="submitCreate"
          />
          <div class="mt-4 flex justify-end gap-2">
            <UButton variant="ghost" :disabled="creating" @click="showCreateDialog = false">
              {{ t('Cancel') }}
            </UButton>
            <UButton :loading="creating" :disabled="!newTeamName.trim()" @click="submitCreate">
              {{ t('Create team') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  navigate: []
}>()

const { t } = useI18n()
const toast = useToast()
const { confirm } = useConfirm()
const { workspaces, activeWorkspace, ownedWorkspaces, memberWorkspaces, switching, leaving, fetchWorkspaces, switchWorkspace, leaveWorkspace } = useWorkspace()
const { isPaid } = usePlan()
const { createTeam } = useTeam()

const teamPopoverOpen = ref(false)
const showInviteDialog = ref(false)
const showCreateDialog = ref(false)
const newTeamName = ref('')
const creating = ref(false)

async function onSwitch(id: string) {
  teamPopoverOpen.value = false
  await switchWorkspace(id)
}

async function onLeave(ws: { id: string, name: string }) {
  teamPopoverOpen.value = false
  const ok = await confirm({
    title: t('Leave {name}?', { name: ws.name }),
    description: t('You will lose access to this team\'s data.'),
    confirmLabel: t('Leave'),
    color: 'error',
  })
  if (!ok) return
  await leaveWorkspace(ws.id)
}

async function onCreateTeam() {
  if (!isPaid.value) {
    toast.add({ title: t('Upgrade to a paid plan to create additional teams'), color: 'warning' })
    return
  }
  teamPopoverOpen.value = false
  newTeamName.value = ''
  showCreateDialog.value = true
}

async function submitCreate() {
  const name = newTeamName.value.trim()
  if (!name) return
  creating.value = true
  try {
    const team = await createTeam(name)
    showCreateDialog.value = false
    await fetchWorkspaces()
    await switchWorkspace(team.id)
    toast.add({ title: t('Team created'), color: 'success' })
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? t('Failed to create team'), color: 'error' })
  }
  finally {
    creating.value = false
  }
}

// Fetch workspaces on mount — keep the switcher snappy.
workspaces.value.length === 0 && fetchWorkspaces()

onMounted(() => {
  if (workspaces.value.length === 0) {
    fetchWorkspaces()
  }
})
</script>
