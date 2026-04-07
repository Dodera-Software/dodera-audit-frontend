import { defineStore } from 'pinia'
import type { ScanStepStatus } from '~/constants/scan'
import { SCAN_STEP_KEYS } from '~/constants/scan'

export interface ExplorationStep {
  stepNumber: number
  maxSteps: number
  action: string
  description: string
  screenshotThumbnail: string | null
  findingCount: number
  finding: { category: string, severity: string, title: string } | null
}

interface ActiveScan {
  auditId: string
  projectId: string
  status: 'scanning' | 'complete' | 'failed'
  currentStep: string
  stepStatuses: Record<string, ScanStepStatus>
  // Exploration tracking
  explorationSteps: ExplorationStep[]
  explorationMaxSteps: number
  currentScreenshot: string | null
  // Analysis pass tracking
  currentPass: number
  totalPasses: number
  currentPassName: string | null
  // Shared
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
        explorationSteps: [],
        explorationMaxSteps: 0, // Updated dynamically from first exploration event
        currentScreenshot: null,
        currentPass: 0,
        totalPasses: 3,
        currentPassName: null,
        error: null,
      }
    },

    handleScanStarted(auditId: string) {
      if (this.activeScan?.auditId !== auditId) return
      this.activeScan.currentStep = 'validating'
      this.activeScan.stepStatuses = buildStepStatuses('validating')
    },

    handleScanProgress(auditId: string, step: string, pass?: number, passTotal?: number, passName?: string) {
      if (this.activeScan?.auditId !== auditId) return

      this.activeScan.currentStep = step
      this.activeScan.stepStatuses = buildStepStatuses(step)

      if (step === 'analyzing') {
        if (pass != null) this.activeScan.currentPass = pass
        if (passTotal != null) this.activeScan.totalPasses = passTotal
        if (passName != null) this.activeScan.currentPassName = passName
      }
    },

    handleExplorationStep(auditId: string, detail: {
      step_number: number
      max_steps: number
      action: string
      description: string
      screenshot_thumbnail?: string | null
      finding_count: number
      finding?: { category: string, severity: string, title: string } | null
    }) {
      if (this.activeScan?.auditId !== auditId) return

      this.activeScan.currentStep = 'exploring'
      this.activeScan.stepStatuses = buildStepStatuses('exploring')
      this.activeScan.explorationMaxSteps = detail.max_steps

      if (detail.screenshot_thumbnail) {
        this.activeScan.currentScreenshot = detail.screenshot_thumbnail
      }

      this.activeScan.explorationSteps.push({
        stepNumber: detail.step_number,
        maxSteps: detail.max_steps,
        action: detail.action,
        description: detail.description,
        screenshotThumbnail: detail.screenshot_thumbnail || null,
        findingCount: detail.finding_count,
        finding: detail.finding || null,
      })
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
