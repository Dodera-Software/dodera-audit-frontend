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

export function scoreLevel(score: number): 'good' | 'moderate' | 'poor' {
  if (score >= SCORE_THRESHOLDS.good) return 'good'
  if (score >= SCORE_THRESHOLDS.moderate) return 'moderate'
  return 'poor'
}
