interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    plan: string
    email_verified_at: string | null
    created_at: string
  }
  token: string
}

interface MeResponse {
  data: AuthResponse['user']
}

export function useAuth() {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const token = useAuthToken()

  async function login(payload: LoginPayload) {
    const data = await $api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })
    token.value = data.token
    authStore.setUser(data.user)
    return data.user
  }

  async function register(payload: RegisterPayload) {
    const data = await $api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    })
    token.value = data.token
    authStore.setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await $api('/auth/logout', { method: 'POST' })
    }
    finally {
      token.value = null
      authStore.clearUser()
    }
  }

  async function fetchMe() {
    const data = await $api<MeResponse>('/auth/me')
    authStore.setUser(data.data)
    return data.data
  }

  async function forgotPassword(email: string) {
    return await $api<{ message: string }>('/auth/password/forgot', {
      method: 'POST',
      body: { email },
    })
  }

  async function resetPassword(payload: { token: string, email: string, password: string, password_confirmation: string }) {
    return await $api<{ message: string }>('/auth/password/reset', {
      method: 'POST',
      body: payload,
    })
  }

  async function resendVerification() {
    return await $api<{ message: string }>('/auth/email/resend', {
      method: 'POST',
    })
  }

  async function googleRedirect() {
    const data = await $api<{ url: string }>('/auth/google/redirect')
    window.location.href = data.url
  }

  return {
    login,
    register,
    logout,
    fetchMe,
    forgotPassword,
    resetPassword,
    resendVerification,
    googleRedirect,
  }
}
