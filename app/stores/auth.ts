import { defineStore } from 'pinia'

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'max'
  is_admin: boolean
  extra_seats: number
  email_verified_at: string | null
  created_at: string
  team_role: 'owner' | 'member' | null
  owned_team_name: string | null
  active_workspace_user_id: string | null
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
