export interface TeamMember {
  id: string
  user_id: string
  role: string
  joined_at: string | null
  user?: { id: string, name: string, email: string }
}

export interface TeamInvitation {
  id: string
  email: string
  invited_by: string
  expires_at: string
  accepted_at: string | null
  is_pending: boolean
}

export interface TeamMembership {
  team_id: string
  team_name: string
  role: string
}

export interface Team {
  id: string
  name: string
  owner_id: string
  members: TeamMember[]
  all_members: TeamMember[]
  invitations: TeamInvitation[]
  member_count: number
}

export interface InvitationInfo {
  token: string
  email: string
  team_name: string
  inviter_name: string
  is_new_user: boolean
  expires_at: string
}

export function useTeam() {
  const { $api } = useApi()

  async function fetchOwnedTeam(): Promise<Team> {
    return $api<Team>('/team')
  }

  async function fetchMembership(): Promise<TeamMembership> {
    return $api<TeamMembership>('/team/membership')
  }

  async function createTeam(name: string): Promise<Team> {
    return $api<Team>('/team', {
      method: 'POST',
      body: { name },
    })
  }

  async function updateTeamName(name: string): Promise<Team> {
    return $api<Team>('/team', {
      method: 'PATCH',
      body: { name },
    })
  }

  async function deleteTeam(): Promise<void> {
    await $api('/team', { method: 'DELETE' })
  }

  async function leaveTeam(teamId?: string): Promise<void> {
    await $api('/team/leave', {
      method: 'POST',
      body: teamId ? { team_id: teamId } : undefined,
    })
  }

  async function inviteMember(email: string): Promise<TeamInvitation> {
    return $api<TeamInvitation>('/team/invitations', {
      method: 'POST',
      body: { email },
    })
  }

  async function revokeInvitation(id: string): Promise<void> {
    await $api(`/team/invitations/${id}`, { method: 'DELETE' })
  }

  async function removeMember(memberId: string): Promise<void> {
    await $api(`/team/members/${memberId}`, { method: 'DELETE' })
  }

  async function fetchInvitation(token: string): Promise<InvitationInfo> {
    return $api<InvitationInfo>(`/invitations/${token}`)
  }

  async function acceptInvitation(token: string): Promise<void> {
    await $api(`/invitations/${token}/accept`, { method: 'POST' })
  }

  async function declineInvitation(token: string): Promise<void> {
    await $api(`/invitations/${token}`, { method: 'DELETE' })
  }

  return {
    fetchOwnedTeam,
    fetchMembership,
    createTeam,
    updateTeamName,
    deleteTeam,
    leaveTeam,
    inviteMember,
    revokeInvitation,
    removeMember,
    fetchInvitation,
    acceptInvitation,
    declineInvitation,
  }
}
