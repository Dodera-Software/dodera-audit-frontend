const COOKIE_NAME = 'auth_token'
const MAX_AGE = 60 * 60 * 24 * 7

// Shared reactive source of truth across every caller. Nuxt's `useCookie`
// creates a fresh ref per call and flushes writes to `document.cookie`
// through a `pre`-scheduled watcher — fine in isolation, but it means a
// caller that reads the token via a new `useCookie` within the same tick
// as `token.value = newToken` sees the OLD value (cookie hasn't been
// written yet). That was logging users out after login: the post-login
// watcher fired `fetchUnreadCount()` before the cookie settled, so the
// request went out without an `Authorization` header and the 401 handler
// bounced them to `/login`. Using `useState` + a direct `document.cookie`
// write keeps reads and writes synchronous for everyone.
export function useAuthToken() {
  const config = useRuntimeConfig()
  const secure = config.public.apiBase.startsWith('https')

  const state = useState<string | null>(COOKIE_NAME, () => {
    const cookie = useCookie<string | null>(COOKIE_NAME, {
      maxAge: MAX_AGE,
      sameSite: 'lax',
      secure,
    })
    return cookie.value ?? null
  })

  return computed({
    get: () => state.value,
    set: (value: string | null) => {
      state.value = value
      if (import.meta.client) writeCookie(value, secure)
    },
  })
}

function writeCookie(value: string | null, secure: boolean) {
  const flags = ['Path=/', 'SameSite=Lax']
  if (secure) flags.push('Secure')
  if (value === null) {
    flags.push('Max-Age=0')
    document.cookie = `${COOKIE_NAME}=; ${flags.join('; ')}`
  }
  else {
    flags.push(`Max-Age=${MAX_AGE}`)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; ${flags.join('; ')}`
  }
}
