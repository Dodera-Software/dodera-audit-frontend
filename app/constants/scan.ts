export const SCAN_STEPS = [
  { key: 'validating', icon: 'i-lucide-shield-check' },
  { key: 'scanning', icon: 'i-lucide-scan' },
  { key: 'extracting', icon: 'i-lucide-file-search' },
  { key: 'analyzing', icon: 'i-lucide-brain' },
  { key: 'synthesizing', icon: 'i-lucide-sparkles' },
  { key: 'assembling', icon: 'i-lucide-puzzle' },
] as const

export const SCAN_STEP_KEYS: string[] = SCAN_STEPS.map(s => s.key)

export const SPECIALIST_AGENTS = [
  { key: 'visual', icon: 'i-lucide-eye' },
  { key: 'trust', icon: 'i-lucide-shield' },
  { key: 'conversion', icon: 'i-lucide-mouse-pointer-click' },
  { key: 'code', icon: 'i-lucide-code' },
  { key: 'content', icon: 'i-lucide-file-text' },
  { key: 'accessibility', icon: 'i-lucide-accessibility' },
  { key: 'seo', icon: 'i-lucide-search' },
] as const

export const PERSONA_AGENTS = [
  { key: 'skeptic', icon: 'i-lucide-search' },
  { key: 'impulse', icon: 'i-lucide-zap' },
  { key: 'comparison', icon: 'i-lucide-scale' },
] as const

/** @deprecated use SPECIALIST_AGENTS + PERSONA_AGENTS */
export const ANALYSIS_AGENTS = [...SPECIALIST_AGENTS, ...PERSONA_AGENTS]

export const ANALYSIS_AGENTS_TOTAL = SPECIALIST_AGENTS.length + PERSONA_AGENTS.length

export const POLL_INTERVAL_MS = 3000

export type ScanStepStatus = 'pending' | 'active' | 'done' | 'failed'
