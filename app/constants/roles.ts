export const UserRole = {
  User: 'user',
  Admin: 'admin',
  SuperAdmin: 'super_admin',
} as const

export type UserRoleValue = typeof UserRole[keyof typeof UserRole]

export function isAdmin(role?: string | null): boolean {
  return role === UserRole.Admin || role === UserRole.SuperAdmin
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === UserRole.SuperAdmin
}
