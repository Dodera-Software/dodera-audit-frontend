export const SCAN_STEPS = [
  { key: 'validating', icon: 'i-lucide-shield-check' },
  { key: 'scanning', icon: 'i-lucide-scan' },
  { key: 'extracting', icon: 'i-lucide-file-search' },
  { key: 'analyzing', icon: 'i-lucide-brain' },
  { key: 'assembling', icon: 'i-lucide-puzzle' },
] as const

export const SCAN_STEP_KEYS = SCAN_STEPS.map(s => s.key)

export const ESTIMATED_STEP_SECONDS: Record<string, number> = {
  validating: 3,
  scanning: 15,
  extracting: 5,
  analyzing: 25,
  assembling: 5,
}

export const TOTAL_ESTIMATED_SECONDS = Object.values(ESTIMATED_STEP_SECONDS).reduce((a, b) => a + b, 0)

export const POLL_INTERVAL_MS = 3000

export type ScanStepStatus = 'pending' | 'active' | 'done' | 'failed'
