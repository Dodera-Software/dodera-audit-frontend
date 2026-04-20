<template>
  <ClientOnly>
    <div class="mx-auto max-w-2xl flex flex-col gap-5">
      <TeamPageSkeleton v-if="loading" />

      <template v-else>
        <!-- Owned teams section -->
        <section class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold text-(--ui-text-highlighted)">{{ t('Your teams') }}</h2>
              <p class="text-sm text-(--ui-text-muted)">
                {{ t('Each team has its own projects and members. Your subscription and seat pool are shared across all your teams.') }}
              </p>
            </div>
            <UButton
              icon="i-lucide-plus"
              size="sm"
              :disabled="!isPaid"
              :title="isPaid ? '' : t('Upgrade to create additional teams')"
              @click="showCreateDialog = true"
            >
              {{ t('New team') }}
            </UButton>
          </div>

          <p v-if="!isPaid" class="rounded-md border border-(--ui-border) bg-(--ui-bg-elevated) p-3 text-xs text-(--ui-text-muted)">
            {{ t('Free plan includes one team. Upgrade to Pro or Max to create additional teams and invite members.') }}
          </p>

          <div class="flex flex-col gap-4">
            <div
              v-for="team in ownedTeams"
              :key="team.id"
              class="rounded-lg border border-(--ui-border) bg-(--ui-bg) p-4"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div v-if="editingTeamId === team.id" class="flex items-center gap-2">
                    <UInput v-model="editingName" size="sm" class="flex-1" @keyup.enter="saveName(team)" />
                    <UButton size="xs" :loading="savingName" @click="saveName(team)">{{ t('Save') }}</UButton>
                    <UButton size="xs" variant="ghost" @click="editingTeamId = null">{{ t('Cancel') }}</UButton>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <h3 class="truncate text-sm font-semibold">{{ team.name }}</h3>
                    <UButton
                      icon="i-lucide-pencil"
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      square
                      :title="t('Rename')"
                      @click="beginRename(team)"
                    />
                  </div>
                  <p class="mt-0.5 text-xs text-(--ui-text-dimmed)">
                    {{ t('{count} member(s)', { count: team.all_members?.length ?? 0 }) }}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <UButton
                    v-if="isPaid && (team.all_members?.length ?? 0) < totalSeats"
                    icon="i-lucide-user-plus"
                    size="xs"
                    color="neutral"
                    variant="soft"
                    @click="openInvite(team)"
                  >
                    {{ t('Invite') }}
                  </UButton>
                  <UButton
                    v-if="ownedTeams.length > 1"
                    icon="i-lucide-trash-2"
                    variant="ghost"
                    color="error"
                    size="xs"
                    square
                    :loading="deletingTeamId === team.id"
                    :title="t('Delete team')"
                    @click="deleteTeamAction(team)"
                  />
                </div>
              </div>

              <div v-if="(team.all_members?.length ?? 0) > 0" class="mt-3 flex flex-col gap-1.5 border-t border-(--ui-border) pt-3">
                <div
                  v-for="member in team.all_members"
                  :key="member.id"
                  class="flex items-center justify-between gap-2 text-sm"
                >
                  <div class="min-w-0">
                    <div class="truncate font-medium">{{ member.user?.name ?? t('Unknown') }}</div>
                    <div class="truncate text-xs text-(--ui-text-dimmed)">{{ member.user?.email }}</div>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <span class="rounded bg-(--ui-bg-elevated) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--ui-text-muted)">
                      {{ member.role }}
                    </span>
                    <UButton
                      v-if="member.role !== 'owner'"
                      icon="i-lucide-user-minus"
                      variant="ghost"
                      color="error"
                      size="xs"
                      square
                      :loading="removingMemberId === member.id"
                      @click="removeMemberAction(team, member)"
                    />
                  </div>
                </div>
              </div>

              <TeamPendingInvitationsCard
                v-if="(team.invitations ?? []).filter(i => i.is_pending).length"
                class="mt-3"
                :invitations="(team.invitations ?? []).filter(i => i.is_pending)"
                :revoking-id="revokingInvitationId"
                @revoke="(id) => revokeInvitationAction(team, id)"
              />
            </div>
          </div>
        </section>

        <!-- Memberships section -->
        <section v-if="memberships.length" class="flex flex-col gap-3">
          <div>
            <h2 class="text-base font-semibold text-(--ui-text-highlighted)">{{ t('Shared with you') }}</h2>
            <p class="text-sm text-(--ui-text-muted)">{{ t('Teams others have invited you to.') }}</p>
          </div>

          <div
            v-for="m in memberships"
            :key="m.team_id"
            class="flex items-center justify-between gap-2 rounded-lg border border-(--ui-border) bg-(--ui-bg) p-4"
          >
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold">{{ m.team_name }}</div>
              <div class="truncate text-xs text-(--ui-text-dimmed)">{{ t('Role: {role}', { role: m.role }) }}</div>
            </div>
            <UButton
              variant="soft"
              color="error"
              size="xs"
              :loading="leavingTeamId === m.team_id"
              @click="leaveTeamAction(m)"
            >
              {{ t('Leave') }}
            </UButton>
          </div>
        </section>

        <!-- Seats / billing summary -->
        <TeamSeatsCard
          v-if="ownedTeams.length"
          :members-count="totalMemberCount"
          :total-seats="totalSeats"
          :billing-status="billingStatus"
          :seat-limit-reached="totalMemberCount >= totalSeats"
          :invite-loading="false"
          :buying-seats="buyingSeats"
          :hide-invite="true"
          @buy-seats="handleBuySeats"
        />

        <TeamSeatsUpgradeModal v-model:open="showUpgradePrompt" @close="showUpgradePrompt = false" />
      </template>

      <UModal v-model:open="showCreateDialog" :ui="{ content: 'max-w-md' }">
        <template #content>
          <div class="flex flex-col px-6 py-5">
            <h3 class="text-base font-semibold">{{ t('Create a new team') }}</h3>
            <p class="mt-1 text-sm text-(--ui-text-muted)">
              {{ t('Teams are isolated workspaces — projects and audits live inside one team. Your subscription is shared.') }}
            </p>
            <UInput
              v-model="newTeamName"
              class="mt-4"
              size="lg"
              :placeholder="t('Team name')"
              :disabled="creatingTeam"
              @keyup.enter="submitCreate"
            />
            <div class="mt-4 flex justify-end gap-2">
              <UButton variant="ghost" :disabled="creatingTeam" @click="showCreateDialog = false">{{ t('Cancel') }}</UButton>
              <UButton :loading="creatingTeam" :disabled="!newTeamName.trim()" @click="submitCreate">{{ t('Create') }}</UButton>
            </div>
          </div>
        </template>
      </UModal>

      <SidebarInviteMemberDialog
        v-if="invitingTeamId"
        v-model:open="showInviteDialog"
        :team-id="invitingTeamId"
        @update:open="(v) => { if (!v) refreshTeams() }"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Team, TeamMember, TeamMembership } from '~/composables/useTeam'
import type { User } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { isPaid, billingStatus, fetchBillingStatus, purchaseSeats } = usePlan()
const authStore = useAuthStore()
const { $api } = useApi()
const { setNavbar } = usePageNavbar()
const { confirm } = useConfirm()
const { fetchWorkspaces } = useWorkspace()
const {
  listTeams,
  listMemberships,
  createTeam,
  updateTeamName,
  deleteTeam,
  leaveTeam,
  revokeInvitation,
  removeMember,
} = useTeam()
const toast = useToast()

const loading = ref(true)
const ownedTeams = ref<Team[]>([])
const memberships = ref<TeamMembership[]>([])

const showCreateDialog = ref(false)
const newTeamName = ref('')
const creatingTeam = ref(false)

const editingTeamId = ref<string | null>(null)
const editingName = ref('')
const savingName = ref(false)

const showInviteDialog = ref(false)
const invitingTeamId = ref<string | null>(null)

const revokingInvitationId = ref<string | null>(null)
const removingMemberId = ref<string | null>(null)
const deletingTeamId = ref<string | null>(null)
const leavingTeamId = ref<string | null>(null)
const buyingSeats = ref(false)
const showUpgradePrompt = ref(false)

const totalSeats = computed(() => {
  if (!billingStatus.value) return 1
  return billingStatus.value.included_seats + billingStatus.value.extra_seats
})

const totalMemberCount = computed(() =>
  ownedTeams.value.reduce((sum, team) => sum + (team.all_members?.length ?? 0), 0),
)

onMounted(async () => {
  setNavbar({ title: t('Teams'), showBack: true })
  await Promise.all([refreshTeams(), fetchBillingStatus()])
})

async function refreshTeams() {
  loading.value = true
  try {
    const [teams, mems] = await Promise.all([listTeams(), listMemberships()])
    ownedTeams.value = teams
    memberships.value = mems
  }
  finally {
    loading.value = false
  }
}

function beginRename(team: Team) {
  editingTeamId.value = team.id
  editingName.value = team.name
}

async function saveName(team: Team) {
  const name = editingName.value.trim()
  if (!name) return
  savingName.value = true
  try {
    const updated = await updateTeamName(team.id, name)
    team.name = updated.name
    editingTeamId.value = null
    await fetchWorkspaces()
    toast.add({ title: t('Team name updated.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to update team name.'), color: 'error' })
  }
  finally {
    savingName.value = false
  }
}

async function submitCreate() {
  const name = newTeamName.value.trim()
  if (!name) return
  creatingTeam.value = true
  try {
    await createTeam(name)
    showCreateDialog.value = false
    newTeamName.value = ''
    await refreshTeams()
    await fetchWorkspaces()
    const userData = await $api<{ data: User }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    toast.add({ title: t('Team created!'), color: 'success' })
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? t('Failed to create team.'), color: 'error' })
  }
  finally {
    creatingTeam.value = false
  }
}

function openInvite(team: Team) {
  invitingTeamId.value = team.id
  showInviteDialog.value = true
}

async function deleteTeamAction(team: Team) {
  const ok = await confirm({
    title: t('Delete {name}?', { name: team.name }),
    description: t('All projects and audits in this team will be permanently deleted. Members will lose access immediately.'),
    confirmLabel: t('Delete team'),
    color: 'error',
    icon: 'i-lucide-trash-2',
  })
  if (!ok) return
  deletingTeamId.value = team.id
  try {
    await deleteTeam(team.id)
    await refreshTeams()
    await fetchWorkspaces()
    const userData = await $api<{ data: User }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    toast.add({ title: t('Team deleted.'), color: 'success' })
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? t('Failed to delete team.'), color: 'error' })
  }
  finally {
    deletingTeamId.value = null
  }
}

async function leaveTeamAction(m: TeamMembership) {
  const ok = await confirm({
    title: t('Leave {name}?', { name: m.team_name }),
    description: t('You will lose access to this team\'s data.'),
    confirmLabel: t('Leave team'),
    color: 'error',
    icon: 'i-lucide-log-out',
  })
  if (!ok) return
  leavingTeamId.value = m.team_id
  try {
    await leaveTeam(m.team_id)
    await refreshTeams()
    await fetchWorkspaces()
    const userData = await $api<{ data: User }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    toast.add({ title: t('You have left the team.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to leave team.'), color: 'error' })
  }
  finally {
    leavingTeamId.value = null
  }
}

async function revokeInvitationAction(team: Team, invitationId: string) {
  revokingInvitationId.value = invitationId
  try {
    await revokeInvitation(team.id, invitationId)
    team.invitations = team.invitations.filter(i => i.id !== invitationId)
    toast.add({ title: t('Invitation revoked.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to revoke invitation.'), color: 'error' })
  }
  finally {
    revokingInvitationId.value = null
  }
}

async function removeMemberAction(team: Team, member: TeamMember) {
  const name = member.user?.name ?? t('this member')
  const ok = await confirm({
    title: t('Remove {name}?', { name }),
    description: t('This member will lose access to the team immediately.'),
    confirmLabel: t('Remove'),
    color: 'error',
    icon: 'i-lucide-user-minus',
  })
  if (!ok) return
  removingMemberId.value = member.id
  try {
    await removeMember(team.id, member.id)
    team.all_members = team.all_members.filter(m => m.id !== member.id)
    team.members = team.members.filter(m => m.id !== member.id)
    toast.add({ title: t('Member removed.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to remove member.'), color: 'error' })
  }
  finally {
    removingMemberId.value = null
  }
}

async function handleBuySeats(count: number) {
  buyingSeats.value = true
  try {
    await purchaseSeats(count)
    toast.add({ title: t('Seats updated successfully.'), color: 'success' })
    await fetchBillingStatus()
    await refreshTeams()
  }
  catch {
    showUpgradePrompt.value = true
  }
  finally {
    buyingSeats.value = false
  }
}
</script>
