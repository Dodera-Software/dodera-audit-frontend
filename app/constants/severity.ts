import type { BadgeColor } from '~/types'

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-500',
  high: 'text-amber-500',
  medium: 'text-blue-500',
  low: 'text-gray-400',
}

export const SEVERITY_BG_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10',
  high: 'bg-amber-500/10',
  medium: 'bg-blue-500/10',
  low: 'bg-gray-500/10',
}

export const SEVERITY_BADGE_COLORS: Record<string, BadgeColor> = {
  critical: 'error',
  high: 'warning',
  medium: 'primary',
  low: 'neutral',
}

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const
