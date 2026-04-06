<template>
  <div class="flex min-h-screen items-center justify-center bg-(--ui-bg)">
    <div class="w-full max-w-md px-4">
      <div class="mb-8 flex justify-center">
        <img src="~/assets/logo/pawbytech-logo.png" alt="PawByTech" class="h-20 w-auto" />
      </div>

      <UCard>
        <!-- Loading -->
        <div v-if="loading" class="space-y-4 py-4">
          <div class="flex justify-center">
            <USkeleton class="h-12 w-12 rounded-xl" />
          </div>
          <div class="space-y-2 text-center">
            <USkeleton class="mx-auto h-5 w-56" />
            <USkeleton class="mx-auto h-4 w-72" />
          </div>
          <USkeleton class="h-10 w-full rounded-lg" />
        </div>

        <!-- Invalid / expired -->
        <div v-else-if="!invitation" class="py-4 text-center">
          <UIcon name="i-lucide-link-2-off" class="mx-auto mb-3 h-10 w-10 text-(--ui-text-muted)" />
          <p class="font-semibold text-(--ui-text-highlighted)">{{ t('Invitation not found') }}</p>
          <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('This invitation link is invalid or has expired.') }}</p>
          <UButton class="mt-4" to="/login">{{ t('Sign in') }}</UButton>
        </div>

        <!-- Valid invitation -->
        <div v-else class="py-2">
          <div class="mb-5 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-(--ui-primary)/10">
              <UIcon name="i-lucide-users" class="h-6 w-6 text-(--ui-primary)" />
            </div>
            <p class="text-lg font-bold text-(--ui-text-highlighted)">
              {{ t("You're invited to join {team}!", { team: invitation.team_name }) }}
            </p>
            <p class="mt-1 text-sm text-(--ui-text-muted)">
              {{ t('{inviter} has invited you to collaborate on PawByTech.', { inviter: invitation.inviter_name }) }}
            </p>
          </div>

          <!-- Logged in as wrong email -->
          <UAlert
            v-if="loggedIn && currentUserEmail !== invitation.email"
            class="mb-4"
            color="warning"
            variant="subtle"
            icon="i-lucide-alert-triangle"
            :title="t('Wrong account')"
            :description="t('This invitation was sent to {email}. Please log in with that account.', { email: invitation.email })"
          />

          <!-- New user: must register -->
          <template v-else-if="invitation.is_new_user && !loggedIn">
            <UAlert
              class="mb-4"
              color="primary"
              variant="subtle"
              icon="i-lucide-info"
              :title="t('Create an account to accept')"
              :description="t('Register with {email} to join the team.', { email: invitation.email })"
            />
            <UButton block size="lg" :to="`/register?email=${encodeURIComponent(invitation.email)}&invitation=${token}`">
              {{ t('Create account & join team') }}
            </UButton>
          </template>

          <!-- Existing user, not logged in -->
          <template v-else-if="!loggedIn">
            <UAlert
              class="mb-4"
              color="primary"
              variant="subtle"
              icon="i-lucide-info"
              :title="t('Sign in to accept')"
              :description="t('Log in with {email} to join the team.', { email: invitation.email })"
            />
            <UButton block size="lg" :to="`/login?redirect=/invitation/${token}`">
              {{ t('Sign in & join team') }}
            </UButton>
          </template>

          <!-- Logged in as correct email -->
          <template v-else>
            <div class="flex gap-2">
              <UButton block size="lg" :loading="accepting" @click="handleAccept">
                {{ t('Accept invitation') }}
              </UButton>
              <UButton block size="lg" variant="outline" color="neutral" :loading="declining" @click="handleDecline">
                {{ t('Decline') }}
              </UButton>
            </div>
          </template>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InvitationInfo } from '~/composables/useTeam'

definePageMeta({ layout: false, ssr: false })

const { t } = useI18n()
const { fetchInvitation, acceptInvitation, declineInvitation } = useTeam()
const authStore = useAuthStore()
const { $api } = useApi()
const route = useRoute()
const toast = useToast()

const token = route.params.token as string

const loading = ref(true)
const invitation = ref<InvitationInfo | null>(null)
const accepting = ref(false)
const declining = ref(false)

const loggedIn = computed(() => !!authStore.user)
const currentUserEmail = computed(() => authStore.user?.email)

onMounted(async () => {
  try {
    invitation.value = await fetchInvitation(token)
  }
  catch {
    invitation.value = null
  }
  finally {
    loading.value = false
  }
})

async function handleAccept() {
  accepting.value = true
  try {
    await acceptInvitation(token)
    // Refresh user so team_role and workspace data are up to date
    const userData = await $api<{ data: typeof authStore.user }>('/auth/me')
    if (userData.data) authStore.setUser(userData.data)
    toast.add({ title: t('Welcome to the team!'), color: 'success' })
    navigateTo('/dashboard')
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? t('Failed to accept invitation.'), color: 'error' })
  }
  finally {
    accepting.value = false
  }
}

async function handleDecline() {
  declining.value = true
  try {
    await declineInvitation(token)
    toast.add({ title: t('Invitation declined.'), color: 'neutral' })
    navigateTo(loggedIn.value ? '/dashboard' : '/login')
  }
  catch {
    navigateTo(loggedIn.value ? '/dashboard' : '/login')
  }
  finally {
    declining.value = false
  }
}
</script>
