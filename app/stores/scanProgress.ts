import { defineStore } from 'pinia'
import type { ScanStepStatus } from '~/constants/scan'
import { SCAN_STEP_KEYS, ANALYSIS_AGENTS_TOTAL } from '~/constants/scan'

interface ActiveScan {
  auditId: string
  projectId: string
  status: 'scanning' | 'complete' | 'failed'
  currentStep: string
  stepStatuses: Record<string, ScanStepStatus>
  agentsCompleted: number
  agentsTotal: number
  error: string | null
}

function buildStepStatuses(activeStep: string): Record<string, ScanStepStatus> {
  const statuses: Record<string, ScanStepStatus> = {}
  let foundActive = false
  for (const key of SCAN_STEP_KEYS) {
    if (key === activeStep) {
      statuses[key] = 'active'
      foundActive = true
    }
    else {
      statuses[key] = foundActive ? 'pending' : 'done'
    }
  }
  return statuses
}

export const useScanProgressStore = defineStore('scanProgress', {
  state: () => ({
    activeScan: null as ActiveScan | null,
  }),

  getters: {
    isScanning: (state) => state.activeScan?.status === 'scanning',

    scanForAudit: (state) => (auditId: string) => {
      return state.activeScan?.auditId === auditId ? state.activeScan : null
    },

    scanForProject: (state) => (projectId: string) => {
      return state.activeScan?.projectId === projectId ? state.activeScan : null
    },
  },

  actions: {
    startScan(auditId: string, projectId: string) {
      this.activeScan = {
        auditId,
        projectId,
        status: 'scanning',
        currentStep: 'validating',
        stepStatuses: buildStepStatuses('validating'),
        agentsCompleted: 0,
        agentsTotal: ANALYSIS_AGENTS_TOTAL,
        error: null,
      }
    },

    handleScanStarted(auditId: string) {
      if (this.activeScan?.auditId !== auditId) return
      this.activeScan.currentStep = 'validating'
      this.activeScan.stepStatuses = buildStepStatuses('validating')
    },

    handleScanProgress(auditId: string, step: string, agentsCompleted?: number, agentsTotal?: number) {
      if (this.activeScan?.auditId !== auditId) return
      this.activeScan.currentStep = step
      this.activeScan.stepStatuses = buildStepStatuses(step)
      if (step === 'analyzing' && agentsCompleted != null && agentsTotal != null) {
        this.activeScan.agentsCompleted = agentsCompleted
        this.activeScan.agentsTotal = agentsTotal
      }
    },

    handleScanComplete(auditId: string) {
      if (this.activeScan?.auditId !== auditId) return
      this.activeScan.status = 'complete'
      this.activeScan.currentStep = 'assembling'
      this.activeScan.stepStatuses = Object.fromEntries(
        SCAN_STEP_KEYS.map(k => [k, 'done' as ScanStepStatus]),
      )
    },

    handleScanFailed(auditId: string, error: string) {
      if (this.activeScan?.auditId !== auditId) return
      this.activeScan.status = 'failed'
      this.activeScan.error = error
      if (this.activeScan.currentStep) {
        this.activeScan.stepStatuses[this.activeScan.currentStep] = 'failed'
      }
    },

    clearScan() {
      this.activeScan = null
    },
  },
})
