import type { BadgeColor } from '~/types'

export const CATEGORY_BADGE_COLORS: Record<string, BadgeColor> = {
  clarity: 'info',
  trust: 'warning',
  conversion: 'primary',
  performance: 'success',
  code_error: 'error',
  accessibility: 'error',
  mobile: 'neutral',
}

export const EFFORT_BADGE_COLORS: Record<string, BadgeColor> = {
  quick: 'success',
  medium: 'warning',
  big: 'error',
}
