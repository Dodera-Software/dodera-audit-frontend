import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  plan: string
  email_verified_at: string | null
  created_at: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: (import.meta.client ? localStorage.getItem('auth_token') : null) as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isEmailVerified: (state) => !!state.user?.email_verified_at,
  },

  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
      }
    },

    logout() {
      this.user = null
      this.token = null
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
      }
    },
  },
})
