export function useAuthToken() {
  const config = useRuntimeConfig()

  return useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: config.public.apiBase.startsWith('https'),
  })
}
