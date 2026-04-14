<template>
  <ClientOnly>
    <div class="mx-auto max-w-2xl flex flex-col gap-4">
      <TeamPageSkeleton v-if="loading" />

      <template v-else>
        <!-- Member of someone else's team -->
        <TeamMembershipView
          v-if="membership"
          :team-name="membership.team_name"
          :loading="leaveLoading"
          @leave="handleLeave"
        />

        <!-- Team owner view -->
        <template v-else-if="team">
          <TeamNameCard :team-name="team.name" :loading="savingName" @save="handleSaveName" />

          <TeamMembersCard
            :members="team.all_members ?? []"
            :total-seats="totalSeats"
            :removing-id="removingMemberId"
            @remove="handleRemoveMember"
          />

          <TeamPendingInvitationsCard
            v-if="pendingInvitations.length > 0"
            :invitations="pendingInvitations"
            :revoking-id="revokingInvitationId"
            @revoke="handleRevokeInvitation"
          />

          <TeamSeatsCard
            :members-count="team.all_members?.length ?? 0"
            :total-seats="totalSeats"
            :billing-status="billingStatus"
            :seat-limit-reached="seatLimitReached"
            :invite-loading="inviteLoading"
            :buying-seats="buyingSeats"
            @invite="handleInvite"
            @buy-seats="handleBuySeats"
          />

          <TeamSeatsUpgradeModal v-model:open="showUpgradePrompt" @close="showUpgradePrompt = false" />

          <TeamDangerZoneCard :loading="deletingTeam" @delete="handleDeleteTeam" />
        </template>

        <!-- No team yet -->
        <TeamCreateView v-else :is-free="isFree" :loading="creatingTeam" @create="handleCreateTeam" />
      </template>
    </div>
  </ClientOnly>
</template>
<script setup lang="ts">
import type { Team, TeamInvitation, TeamMember, TeamMembership } from '~/composables/useTeam'
import type { User } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { isFree, billingStatus, fetchBillingStatus, purchaseSeats } = usePlan()
const authStore = useAuthStore()
const { $api } = useApi()
const { setNavbar } = usePageNavbar()
const { confirm } = useConfirm()
const { fetchWorkspaces } = useWorkspace()
const {
  fetchOwnedTeam,
  fetchMembership,
  createTeam,
  updateTeamName,
  leaveTeam,
  deleteTeam,
  inviteMember,
  revokeInvitation,
  removeMember,
} = useTeam()
const toast = useToast()

const loading = ref(true)
const team = ref<Team | null>(null)
const membership = ref<TeamMembership | null>(null)

const inviteLoading = ref(false)
const revokingInvitationId = ref<string | null>(null)
const removingMemberId = ref<string | null>(null)
const savingName = ref(false)
const creatingTeam = ref(false)
const leaveLoading = ref(false)
const deletingTeam = ref(false)
const buyingSeats = ref(false)
const showUpgradePrompt = ref(false)

const pendingInvitations = computed(() => team.value?.invitations?.filter(i => i.is_pending) ?? [])

const totalSeats = computed(() => {
  if (!billingStatus.value) return 1
  return billingStatus.value.included_seats + billingStatus.value.extra_seats
})

// all_members includes owner â€” owner counts as a seat
const seatLimitReached = computed(() =>
  (team.value?.all_members?.length ?? 0) >= totalSeats.value,
)

onMounted(async () => {
  setNavbar({ title: t('Team'), showBack: true })
  await Promise.all([loadTeamState(), fetchBillingStatus()])
})

async function loadTeamState() {
  loading.value = true
  try {
    team.value = await fetchOwnedTeam()
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number, status?: number }
    if (err?.statusCode === 404 || err?.status === 404) {
      team.value = null
      try {
        membership.value = await fetchMembership()
      }
      catch {
        membership.value = null
      }
    }
  }
  finally {
    loading.value = false
  }
}

async function handleSaveName(name: string) {
  savingName.value = true
  try {
    const updated = await updateTeamName(name)
    if (team.value) team.value.name = updated.name
    toast.add({ title: t('Team name updated.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to update team name.'), color: 'error' })
  }
  finally {
    savingName.value = false
  }
}

async function handleCreateTeam(name: string) {
  creatingTeam.value = true
  try {
    team.value = await createTeam(name)

    // Refresh user (team_role changes) and workspace list in sidebar
    const userData = await $api<{ data: User }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    await fetchWorkspaces()

    toast.add({ title: t('Team created!'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to create team.'), color: 'error' })
  }
  finally {
    creatingTeam.value = false
  }
}

async function handleInvite(email: string) {
  inviteLoading.value = true
  try {
    const inv = await inviteMember(email)
    team.value?.invitations?.push(inv)
    toast.add({ title: t('Invitation sent!'), color: 'success' })
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? t('Failed to send invitation.'), color: 'error' })
  }
  finally {
    inviteLoading.value = false
  }
}

async function handleRevokeInvitation(id: string) {
  revokingInvitationId.value = id
  try {
    await revokeInvitation(id)
    if (team.value) {
      team.value.invitations = team.value.invitations.filter((i: TeamInvitation) => i.id !== id)
    }
    toast.add({ title: t('Invitation revoked.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to revoke invitation.'), color: 'error' })
  }
  finally {
    revokingInvitationId.value = null
  }
}

async function handleRemoveMember(member: TeamMember) {
  const name = member.user?.name ?? t('this member')
  const confirmed = await confirm({
    title: t('Remove {name}?', { name }),
    description: t('This member will lose access to all shared projects immediately.'),
    confirmLabel: t('Remove'),
    color: 'error',
    icon: 'i-lucide-user-minus',
  })
  if (!confirmed) return
  removingMemberId.value = member.id
  try {
    await removeMember(member.id)
    if (team.value) {
      team.value.members = team.value.members.filter((m: TeamMember) => m.id !== member.id)
      team.value.all_members = team.value.all_members.filter((m: TeamMember) => m.id !== member.id)
    }
    toast.add({ title: t('Member removed.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to remove member.'), color: 'error' })
  }
  finally {
    removingMemberId.value = null
  }
}

async function handleDeleteTeam() {
  const confirmed = await confirm({
    title: t('Delete this team?'),
    description: t('All members will immediately lose access to shared projects. This action cannot be undone.'),
    confirmLabel: t('Delete team'),
    color: 'error',
    icon: 'i-lucide-trash-2',
  })
  if (!confirmed) return
  deletingTeam.value = true
  try {
    await deleteTeam()
    team.value = null
    const userData = await $api<{ data: User }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    await fetchWorkspaces()
    toast.add({ title: t('Team deleted.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to delete team.'), color: 'error' })
  }
  finally {
    deletingTeam.value = false
  }
}

async function handleBuySeats(count: number) {
  buyingSeats.value = true
  try {
    await purchaseSeats(count)
    toast.add({ title: t('Seats updated successfully.'), color: 'success' })
    await fetchBillingStatus()
    await loadTeamState()
  }
  catch {
    showUpgradePrompt.value = true
  }
  finally {
    buyingSeats.value = false
  }
}

async function handleLeave() {
  const confirmed = await confirm({
    title: t('Leave this team?'),
    description: t('You will lose access to all shared projects. This action cannot be undone.'),
    confirmLabel: t('Leave team'),
    color: 'error',
    icon: 'i-lucide-log-out',
  })
  if (!confirmed) return
  leaveLoading.value = true
  try {
    await leaveTeam(membership.value?.team_id)
    membership.value = null
    const userData = await $api<{ data: User }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    toast.add({ title: t('You have left the team.'), color: 'success' })
    await navigateTo('/dashboard')
  }
  catch {
    toast.add({ title: t('Failed to leave team.'), color: 'error' })
  }
  finally {
    leaveLoading.value = false
  }
}
</script>
