import { defineStore } from 'pinia'
import type { UserRoleValue } from '~/constants/roles'

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'max'
  auth_provider: 'email' | 'google'
  avatar_url: string | null
  role: UserRoleValue
  extra_seats: number
  email_verified_at: string | null
  created_at: string
  team_role: 'owner' | 'member' | null
  active_team_id: string | null
  active_team_name: string | null
  default_project_id: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),

  getters: {
    isEmailVerified: (state) => !!state.user?.email_verified_at,
  },

  actions: {
    setUser(user: User) {
      this.user = user
    },

    clearUser() {
      this.user = null
    },
  },
})
