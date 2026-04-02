export const SCORE_THRESHOLDS = {
  good: 80,
  moderate: 50,
} as const

export const SCORE_COLORS = {
  good: 'text-green-500',
  moderate: 'text-yellow-500',
  poor: 'text-red-500',
} as const

export function scoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.good) return SCORE_COLORS.good
  if (score >= SCORE_THRESHOLDS.moderate) return SCORE_COLORS.moderate
  return SCORE_COLORS.poor
}

export const SCORE_BG_COLORS = {
  good: 'bg-green-500',
  moderate: 'bg-yellow-500',
  poor: 'bg-red-500',
} as const

export function scoreLevel(score: number): 'good' | 'moderate' | 'poor' {
  if (score >= SCORE_THRESHOLDS.good) return 'good'
  if (score >= SCORE_THRESHOLDS.moderate) return 'moderate'
  return 'poor'
}

export function scoreCircleClass(score: number): string {
  if (score >= SCORE_THRESHOLDS.good) return 'border-green-500 text-green-500'
  if (score >= SCORE_THRESHOLDS.moderate) return 'border-yellow-500 text-yellow-500'
  return 'border-red-500 text-red-500'
}

export const SCORE_CATEGORIES = [
  { key: 'clarity', icon: 'i-lucide-type' },
  { key: 'trust', icon: 'i-lucide-shield-check' },
  { key: 'conversion', icon: 'i-lucide-target' },
  { key: 'performance', icon: 'i-lucide-zap' },
  { key: 'technical', icon: 'i-lucide-code' },
  { key: 'seo', icon: 'i-lucide-search' },
] as const

export type ScoreCategoryKey = (typeof SCORE_CATEGORIES)[number]['key']
