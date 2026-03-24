import { scoreLevel } from '~/constants/audit'

export function useScoreLabel() {
  const { t } = useI18n()

  const labels = {
    good: () => t('Good'),
    moderate: () => t('Needs improvement'),
    poor: () => t('Poor'),
  } as const

  function scoreLabel(score: number): string {
    return labels[scoreLevel(score)]()
  }

  return { scoreLabel }
}
