export interface PersonaMeta {
  key: string
  icon: string
  color: string
  borderColor: string
}

export const PERSONA_META: Record<string, PersonaMeta> = {
  skeptic: {
    key: 'skeptic',
    icon: 'i-lucide-search',
    color: 'text-amber-600',
    borderColor: 'border-amber-500',
  },
  impulse: {
    key: 'impulse',
    icon: 'i-lucide-zap',
    color: 'text-blue-600',
    borderColor: 'border-blue-500',
  },
  comparison: {
    key: 'comparison',
    icon: 'i-lucide-scale',
    color: 'text-purple-600',
    borderColor: 'border-purple-500',
  },
} as const

export const VERDICT_CONFIG = {
  yes: { label: 'Would convert', color: 'success' as const, icon: 'i-lucide-check' },
  no: { label: 'Would not convert', color: 'error' as const, icon: 'i-lucide-x' },
  maybe: { label: 'Uncertain', color: 'warning' as const, icon: 'i-lucide-minus' },
} as const

export type VerdictKey = keyof typeof VERDICT_CONFIG
