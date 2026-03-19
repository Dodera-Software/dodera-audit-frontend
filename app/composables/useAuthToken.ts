export function useAuthToken() {
  return useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: false, // set true in production with HTTPS
  })
}
