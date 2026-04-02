<template>
  <ClientOnly>
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 flex items-center gap-4">
        <UButton variant="ghost" icon="i-lucide-arrow-left" size="xs" @click="router.back()" />
        <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ t('Team') }}</h1>
      </div>

    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <template v-else>
      <!-- Member of someone else's team -->
      <template v-if="membership">
        <UCard class="mb-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-(--ui-primary)/10">
              <UIcon name="i-lucide-users" class="h-5 w-5 text-(--ui-primary)" />
            </div>
            <div>
              <p class="font-semibold text-(--ui-text-highlighted)">{{ membership.team_name }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('You are a member of this team') }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Leave team') }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">{{ t('You will lose access to all shared projects.') }}</p>
            </div>
            <UButton
              color="error"
              variant="outline"
              size="sm"
              :loading="leaveLoading"
              @click="handleLeave"
            >
              {{ t('Leave') }}
            </UButton>
          </div>
        </UCard>
      </template>

      <!-- Team owner view -->
      <template v-else-if="team">
        <!-- Team name -->
        <UCard class="mb-4">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Team name') }}</p>
              <UInput
                v-if="editingName"
                v-model="teamNameInput"
                size="sm"
                class="mt-1 max-w-xs"
                @keyup.enter="handleSaveName"
                @keyup.escape="editingName = false"
              />
              <p v-else class="mt-1 font-semibold text-(--ui-text-highlighted)">{{ team.name }}</p>
            </div>
            <div class="flex gap-2">
              <template v-if="editingName">
                <UButton size="xs" :loading="savingName" @click="handleSaveName">{{ t('Save') }}</UButton>
                <UButton size="xs" variant="ghost" color="neutral" @click="editingName = false">{{ t('Cancel') }}</UButton>
              </template>
              <UButton v-else size="xs" variant="ghost" color="neutral" icon="i-lucide-pencil" @click="startEditName">
                {{ t('Edit') }}
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Members -->
        <UCard class="mb-4">
          <h3 class="mb-4 text-sm font-semibold text-(--ui-text-highlighted)">
            {{ t('Members') }}
            <span class="ml-1 text-(--ui-text-dimmed)">({{ team.all_members?.length ?? 0 }}/{{ totalSeats }} {{ t('seats used') }})</span>
          </h3>

          <div v-if="team.all_members && team.all_members.length > 0" class="space-y-2">
            <div
              v-for="member in team.all_members"
              :key="member.id"
              class="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-(--ui-bg-elevated)"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex h-7 w-7 items-center justify-center rounded-full bg-(--ui-primary)/15 text-xs font-semibold text-(--ui-primary)">
                  {{ member.user?.name?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-medium text-(--ui-text-highlighted)">
                    {{ member.user?.name }}
                    <UBadge v-if="member.role === 'owner'" color="neutral" variant="subtle" size="xs" class="ml-1">{{ t('Owner') }}</UBadge>
                  </p>
                  <p class="text-xs text-(--ui-text-muted)">{{ member.user?.email }}</p>
                </div>
              </div>
              <UButton
                v-if="member.role !== 'owner'"
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-user-minus"
                :loading="removingMemberId === member.id"
                @click="handleRemoveMember(member)"
              >
                {{ t('Remove') }}
              </UButton>
            </div>
          </div>
          <p v-else class="text-sm text-(--ui-text-muted)">{{ t('No members yet. Invite someone below.') }}</p>
        </UCard>

        <!-- Pending invitations -->
        <UCard v-if="pendingInvitations.length > 0" class="mb-4">
          <h3 class="mb-3 text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Pending invitations') }}</h3>
          <div class="space-y-2">
            <div
              v-for="inv in pendingInvitations"
              :key="inv.id"
              class="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
            >
              <div>
                <p class="text-sm text-(--ui-text-highlighted)">{{ inv.email }}</p>
                <p class="text-xs text-(--ui-text-muted)">{{ t('Expires') }} {{ formatDate(inv.expires_at) }}</p>
              </div>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                :loading="revokingInvitationId === inv.id"
                @click="handleRevokeInvitation(inv.id)"
              >
                {{ t('Revoke') }}
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Seat management -->
        <UCard class="mb-4">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Team seats') }}</h3>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">
                {{ t('{used} of {total} seats used', { used: team.all_members?.length ?? 0, total: totalSeats }) }}
                <span v-if="billingStatus?.included_seats" class="text-(--ui-text-dimmed)"> · {{ billingStatus.included_seats }} {{ t('included') }}</span>
                <span v-if="billingStatus?.extra_seats" class="text-(--ui-text-dimmed)">, {{ billingStatus.extra_seats }} {{ t('purchased') }}</span>
              </p>
            </div>
            <UButton size="xs" variant="outline" color="neutral" icon="i-lucide-plus" @click="showBuySeats = !showBuySeats">
              {{ t('Buy seats') }}
            </UButton>
          </div>

          <!-- Buy seats inline form -->
          <div v-if="showBuySeats" class="mb-4 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-3">
            <p class="mb-2 text-xs text-(--ui-text-muted)">{{ t('Each extra seat costs €10/month and is added to your subscription.') }}</p>
            <div class="flex items-center gap-2">
              <UButton size="xs" variant="outline" color="neutral" icon="i-lucide-minus" :disabled="seatsToBuy <= 1" @click="seatsToBuy = Math.max(1, seatsToBuy - 1)" />
              <span class="w-8 text-center text-sm font-semibold">{{ seatsToBuy }}</span>
              <UButton size="xs" variant="outline" color="neutral" icon="i-lucide-plus" @click="seatsToBuy++" />
              <span class="ml-1 text-xs text-(--ui-text-muted)">× €10/mo = <strong>€{{ seatsToBuy * 10 }}/mo</strong></span>
              <UButton size="sm" class="ml-auto" :loading="buyingSeats" @click="handleBuySeats">
                {{ t('Purchase') }}
              </UButton>
            </div>
          </div>

          <!-- Invite form -->
          <h3 class="mb-2 text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Invite a member') }}</h3>

          <UAlert
            v-if="seatLimitReached"
            class="mb-3"
            color="warning"
            variant="subtle"
            icon="i-lucide-alert-triangle"
            :title="t('No seats available')"
            :description="t('Purchase additional seats to invite more members.')"
          />

          <div class="flex gap-2">
            <UInput
              v-model="inviteEmail"
              type="email"
              placeholder="colleague@example.com"
              class="flex-1"
              :disabled="seatLimitReached || inviteLoading"
              @keyup.enter="handleInvite"
            />
            <UButton
              :loading="inviteLoading"
              :disabled="seatLimitReached || !inviteEmail"
              icon="i-lucide-send"
              @click="handleInvite"
            >
              {{ t('Invite') }}
            </UButton>
          </div>
        </UCard>

        <!-- Delete team -->
        <UCard>
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Delete team') }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">{{ t('All members will lose access. This cannot be undone.') }}</p>
            </div>
            <UButton
              color="error"
              variant="outline"
              size="sm"
              :loading="deletingTeam"
              @click="handleDeleteTeam"
            >
              {{ t('Delete') }}
            </UButton>
          </div>
        </UCard>
      </template>

      <!-- No team yet -->
      <template v-else>
        <UCard v-if="isFree" class="border-(--ui-primary)/20 bg-(--ui-primary)/3">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--ui-primary)/10">
              <UIcon name="i-lucide-users" class="h-5 w-5 text-(--ui-primary)" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Teams are available on paid plans') }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">
                {{ t('Upgrade to Pro or Max to invite team members and collaborate on audit pages.') }}
              </p>
            </div>
            <UButton size="sm" to="/pricing">{{ t('Upgrade') }}</UButton>
          </div>
        </UCard>

        <UCard v-else>
          <div class="py-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--ui-primary)/10">
              <UIcon name="i-lucide-users" class="h-6 w-6 text-(--ui-primary)" />
            </div>
            <p class="mb-1 font-semibold text-(--ui-text-highlighted)">{{ t('Create your team') }}</p>
            <p class="mb-4 text-sm text-(--ui-text-muted)">{{ t('Invite teammates to collaborate on your audit pages.') }}</p>

            <div class="mx-auto flex max-w-xs flex-col gap-2">
              <UInput v-model="newTeamName" :placeholder="t('Team name')" size="lg" />
              <UButton block :loading="creatingTeam" :disabled="!newTeamName.trim()" @click="handleCreateTeam">
                {{ t('Create team') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
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
const { formatDate } = useFormatters()
const authStore = useAuthStore()
const { $api } = useApi()
const router = useRouter()
const {
  fetchOwnedTeam,
  fetchMembership,
  createTeam,
  updateTeamName,
  deleteTeam,
  leaveTeam,
  inviteMember,
  revokeInvitation,
  removeMember,
} = useTeam()
const toast = useToast()

const loading = ref(true)
const team = ref<Team | null>(null)
const membership = ref<TeamMembership | null>(null)

const inviteEmail = ref('')
const inviteLoading = ref(false)
const revokingInvitationId = ref<string | null>(null)
const removingMemberId = ref<string | null>(null)

const editingName = ref(false)
const teamNameInput = ref('')
const savingName = ref(false)

const newTeamName = ref('')
const creatingTeam = ref(false)
const deletingTeam = ref(false)
const leaveLoading = ref(false)
const showBuySeats = ref(false)
const seatsToBuy = ref(1)
const buyingSeats = ref(false)

const pendingInvitations = computed(() => team.value?.invitations?.filter(i => i.is_pending) ?? [])

const totalSeats = computed(() => {
  if (!billingStatus.value) return 1
  return billingStatus.value.included_seats + billingStatus.value.extra_seats
})

// all_members includes owner — owner counts as a seat
const seatLimitReached = computed(() =>
  (team.value?.all_members?.length ?? 0) >= totalSeats.value,
)

onMounted(async () => {
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

function startEditName() {
  teamNameInput.value = team.value?.name ?? ''
  editingName.value = true
}

async function handleSaveName() {
  if (!teamNameInput.value.trim()) return
  savingName.value = true
  try {
    const updated = await updateTeamName(teamNameInput.value.trim())
    if (team.value) team.value.name = updated.name
    editingName.value = false
    toast.add({ title: t('Team name updated.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to update team name.'), color: 'error' })
  }
  finally {
    savingName.value = false
  }
}

async function handleCreateTeam() {
  if (!newTeamName.value.trim()) return
  creatingTeam.value = true
  try {
    team.value = await createTeam(newTeamName.value.trim())
    newTeamName.value = ''
    toast.add({ title: t('Team created!'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to create team.'), color: 'error' })
  }
  finally {
    creatingTeam.value = false
  }
}

async function handleInvite() {
  if (!inviteEmail.value) return
  inviteLoading.value = true
  try {
    const inv = await inviteMember(inviteEmail.value)
    team.value?.invitations?.push(inv)
    inviteEmail.value = ''
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
  if (!confirm(t('Remove {name} from the team?', { name }))) return
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
  if (!confirm(t('Delete your team? All members will lose access.'))) return
  deletingTeam.value = true
  try {
    await deleteTeam()
    team.value = null
    const userData = await $api<{ data: User }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    toast.add({ title: t('Team deleted.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to delete team.'), color: 'error' })
  }
  finally {
    deletingTeam.value = false
  }
}

async function handleBuySeats() {
  buyingSeats.value = true
  try {
    await purchaseSeats(seatsToBuy.value)
    toast.add({ title: t('Seats updated successfully.'), color: 'success' })
    await fetchBillingStatus()
    await loadTeamState()
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? t('Failed to purchase seats.'), color: 'error' })
  }
  finally {
    buyingSeats.value = false
  }
}

async function handleLeave() {
  if (!confirm(t('Leave this team? You will lose access to all shared projects.'))) return
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
