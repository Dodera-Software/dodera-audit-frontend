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

  async function listTeams(): Promise<Team[]> {
    const { data } = await $api<{ data: Team[] }>('/teams')
    return data
  }

  async function listMemberships(): Promise<TeamMembership[]> {
    const { data } = await $api<{ data: TeamMembership[] }>('/teams/memberships')
    return data
  }

  async function fetchTeam(teamId: string): Promise<Team> {
    // TeamResource::$wrap = null — single resource is not data-wrapped.
    return $api<Team>(`/teams/${teamId}`)
  }

  async function createTeam(name: string): Promise<Team> {
    return $api<Team>('/teams', {
      method: 'POST',
      body: { name },
    })
  }

  async function updateTeamName(teamId: string, name: string): Promise<Team> {
    return $api<Team>(`/teams/${teamId}`, {
      method: 'PATCH',
      body: { name },
    })
  }

  async function deleteTeam(teamId: string): Promise<void> {
    await $api(`/teams/${teamId}`, { method: 'DELETE' })
  }

  async function leaveTeam(teamId: string): Promise<void> {
    await $api(`/teams/${teamId}/leave`, { method: 'POST' })
  }

  async function inviteMember(teamId: string, email: string): Promise<TeamInvitation> {
    // TeamInvitationResource doesn't wrap either.
    return $api<TeamInvitation>(`/teams/${teamId}/invitations`, {
      method: 'POST',
      body: { email },
    })
  }

  async function revokeInvitation(teamId: string, invitationId: string): Promise<void> {
    await $api(`/teams/${teamId}/invitations/${invitationId}`, { method: 'DELETE' })
  }

  async function removeMember(teamId: string, memberId: string): Promise<void> {
    await $api(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' })
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
    listTeams,
    listMemberships,
    fetchTeam,
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
