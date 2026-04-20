import { useAuthStore } from '~/stores/auth'
import { usePlan } from '~/composables/usePlan'

export interface Workspace {
  id: string // always the team_id in the new API
  team_id: string
  name: string
  type: 'owned' | 'member'
  role: 'owner' | 'member'
  owner_name?: string
  is_active: boolean
}

export function useWorkspace() {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const toast = useToast()
  const { t } = useI18n()

  const workspaces = useState<Workspace[]>('workspaces', () => [])
  const loading = ref(false)
  const switching = ref(false)
  const leaving = ref<string | null>(null)

  const activeWorkspace = computed(() => workspaces.value.find(w => w.is_active) ?? workspaces.value[0] ?? null)
  const ownedWorkspaces = computed(() => workspaces.value.filter(w => w.type === 'owned'))
  const memberWorkspaces = computed(() => workspaces.value.filter(w => w.type === 'member'))

  async function fetchWorkspaces() {
    loading.value = true
    try {
      const data = await $api<{ data: Workspace[] }>('/workspaces')
      workspaces.value = data.data
    }
    catch {
      // silently fail — sidebar should not crash
    }
    finally {
      loading.value = false
    }
  }

  async function switchWorkspace(teamId: string | null) {
    if (switching.value) return
    switching.value = true
    try {
      await $api('/workspaces/switch', {
        method: 'POST',
        body: { team_id: teamId },
      })

      workspaces.value = workspaces.value.map(w => ({
        ...w,
        is_active: teamId === null ? w.type === 'owned' && w === workspaces.value.find(x => x.type === 'owned') : w.id === teamId,
      }))

      const userData = await $api<{ data: typeof authStore.user }>('/auth/me')
      if (userData.data) {
        authStore.setUser(userData.data)
      }

      usePlan().invalidateBillingStatus()

      toast.add({ title: t('Workspace switched'), color: 'success' })
      await navigateTo('/dashboard')
    }
    catch {
      toast.add({ title: t('Failed to switch workspace'), color: 'error' })
    }
    finally {
      switching.value = false
    }
  }

  async function leaveWorkspace(teamId: string) {
    leaving.value = teamId
    try {
      await $api(`/teams/${teamId}/leave`, { method: 'POST' })

      workspaces.value = workspaces.value.filter(w => w.id !== teamId)

      const stillActive = workspaces.value.find(w => w.is_active)
      if (!stillActive) {
        const firstOwned = workspaces.value.find(w => w.type === 'owned')
        if (firstOwned) {
          await switchWorkspace(firstOwned.id)
        }
      }
      else {
        const userData = await $api<{ data: typeof authStore.user }>('/auth/me')
        if (userData.data) authStore.setUser(userData.data)
      }

      toast.add({ title: t('You have left the team'), color: 'success' })
    }
    catch {
      toast.add({ title: t('Failed to leave team'), color: 'error' })
    }
    finally {
      leaving.value = null
    }
  }

  async function deleteWorkspace(teamId: string) {
    try {
      await $api(`/teams/${teamId}`, { method: 'DELETE' })
      await fetchWorkspaces()
      const userData = await $api<{ data: typeof authStore.user }>('/auth/me')
      if (userData.data) authStore.setUser(userData.data)
      toast.add({ title: t('Team deleted'), color: 'success' })
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      toast.add({ title: err?.data?.message ?? t('Failed to delete team'), color: 'error' })
    }
  }

  return {
    workspaces,
    activeWorkspace,
    ownedWorkspaces,
    memberWorkspaces,
    loading,
    switching,
    leaving,
    fetchWorkspaces,
    switchWorkspace,
    leaveWorkspace,
    deleteWorkspace,
  }
}
