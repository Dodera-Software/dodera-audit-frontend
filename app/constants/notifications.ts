/**
 * Mirrors App\Enums\NotificationType in the backend.
 * Keep both enums in sync — values are used as wire identifiers.
 */
export const NotificationType = {
  AuditCompleted: 'audit_completed',
  AuditFailed: 'audit_failed',
  TeamInvitationReceived: 'team_invitation_received',
  TeamInvitationAccepted: 'team_invitation_accepted',
  SystemAnnouncement: 'system_announcement',
} as const

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType]

export interface NotificationTypeMeta {
  defaultIcon: string
  iconBgClass: string
  iconColorClass: string
}

const DEFAULT_META: NotificationTypeMeta = {
  defaultIcon: 'i-lucide-bell',
  iconBgClass: 'bg-(--ui-bg-muted)',
  iconColorClass: 'text-(--ui-text-muted)',
}

export const NOTIFICATION_TYPE_META: Record<NotificationTypeValue, NotificationTypeMeta> = {
  [NotificationType.AuditCompleted]: {
    defaultIcon: 'i-lucide-sparkles',
    iconBgClass: 'bg-(--ui-primary)/15',
    iconColorClass: 'text-(--ui-primary)',
  },
  [NotificationType.AuditFailed]: {
    defaultIcon: 'i-lucide-circle-alert',
    iconBgClass: 'bg-red-500/15',
    iconColorClass: 'text-red-500',
  },
  [NotificationType.TeamInvitationReceived]: {
    defaultIcon: 'i-lucide-user-plus',
    iconBgClass: 'bg-blue-500/15',
    iconColorClass: 'text-blue-500',
  },
  [NotificationType.TeamInvitationAccepted]: {
    defaultIcon: 'i-lucide-users',
    iconBgClass: 'bg-blue-500/15',
    iconColorClass: 'text-blue-500',
  },
  [NotificationType.SystemAnnouncement]: {
    defaultIcon: 'i-lucide-megaphone',
    iconBgClass: 'bg-amber-500/15',
    iconColorClass: 'text-amber-500',
  },
}

export function notificationTypeMeta(type: string | null | undefined): NotificationTypeMeta {
  if (!type) return DEFAULT_META
  return NOTIFICATION_TYPE_META[type as NotificationTypeValue] ?? DEFAULT_META
}
