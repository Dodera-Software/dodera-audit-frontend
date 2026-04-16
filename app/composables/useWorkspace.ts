import { useAuthStore } from '~/stores/auth'
import { usePlan } from '~/composables/usePlan'

export interface Workspace {
  id: string
  team_id?: string
  name: string
  type: 'personal' | 'team'
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
  const personalWorkspace = computed(() => workspaces.value.find(w => w.type === 'personal') ?? null)
  const memberWorkspaces = computed(() => workspaces.value.filter(w => w.type === 'team' && w.role === 'member'))

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

  async function switchWorkspace(workspaceId: string) {
    if (switching.value) return
    switching.value = true
    try {
      await $api('/workspaces/switch', {
        method: 'POST',
        body: { workspace_id: workspaceId },
      })

      workspaces.value = workspaces.value.map(w => ({ ...w, is_active: w.id === workspaceId }))

      const userData = await $api<{ data: typeof authStore.user }>('/auth/me')
      if (userData.data) {
        authStore.setUser(userData.data)
      }

      usePlan().invalidateBillingStatus()

      toast.add({ title: t('Team switched'), color: 'success' })
      await navigateTo('/dashboard')
    }
    catch {
      toast.add({ title: t('Failed to switch team'), color: 'error' })
    }
    finally {
      switching.value = false
    }
  }

  async function leaveWorkspace(teamId: string, workspaceId: string) {
    leaving.value = workspaceId
    try {
      await $api('/team/leave', {
        method: 'POST',
        body: { team_id: teamId },
      })

      workspaces.value = workspaces.value.filter(w => w.id !== workspaceId || w.type === 'personal')

      // If we just left our active workspace, switch back to personal
      const stillActive = workspaces.value.find(w => w.is_active)
      if (!stillActive && personalWorkspace.value) {
        await switchWorkspace(personalWorkspace.value.id)
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

  async function deleteOwnedTeam() {
    try {
      await $api('/team', { method: 'DELETE' })
      workspaces.value = workspaces.value.map(w =>
        w.type === 'personal' ? { ...w, name: w.name } : w,
      )
      const userData = await $api<{ data: typeof authStore.user }>('/auth/me')
      if (userData.data) authStore.setUser(userData.data)
      toast.add({ title: t('Team deleted'), color: 'success' })
    }
    catch {
      toast.add({ title: t('Failed to delete team'), color: 'error' })
    }
  }

  return {
    workspaces,
    activeWorkspace,
    personalWorkspace,
    memberWorkspaces,
    loading,
    switching,
    leaving,
    fetchWorkspaces,
    switchWorkspace,
    leaveWorkspace,
    deleteOwnedTeam,
  }
}
