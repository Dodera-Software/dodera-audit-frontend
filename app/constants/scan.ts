export const SCAN_STEPS = [
  { key: 'validating', icon: 'i-lucide-shield-check' },
  { key: 'exploring', icon: 'i-lucide-compass' },
  { key: 'analyzing', icon: 'i-lucide-brain' },
  { key: 'synthesizing', icon: 'i-lucide-sparkles' },
  { key: 'assembling', icon: 'i-lucide-puzzle' },
] as const

export const SCAN_STEP_KEYS: string[] = SCAN_STEPS.map(s => s.key)

export const POLL_INTERVAL_MS = 3000

export type ScanStepStatus = 'pending' | 'active' | 'done' | 'failed'
