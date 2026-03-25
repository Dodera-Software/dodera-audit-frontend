export const SCAN_STEPS = [
  { key: 'validating', icon: 'i-lucide-shield-check' },
  { key: 'scanning', icon: 'i-lucide-scan' },
  { key: 'extracting', icon: 'i-lucide-file-search' },
  { key: 'analyzing', icon: 'i-lucide-brain' },
  { key: 'assembling', icon: 'i-lucide-puzzle' },
] as const

export const SCAN_STEP_KEYS: string[] = SCAN_STEPS.map(s => s.key)

export const ANALYSIS_AGENTS = [
  { key: 'visual', icon: 'i-lucide-eye' },
  { key: 'trust', icon: 'i-lucide-shield' },
  { key: 'conversion', icon: 'i-lucide-mouse-pointer-click' },
  { key: 'code', icon: 'i-lucide-code' },
  { key: 'skeptic', icon: 'i-lucide-search' },
  { key: 'impulse', icon: 'i-lucide-zap' },
  { key: 'comparison', icon: 'i-lucide-scale' },
] as const

export const ANALYSIS_AGENTS_TOTAL = 7

export const POLL_INTERVAL_MS = 3000

export type ScanStepStatus = 'pending' | 'active' | 'done' | 'failed'
