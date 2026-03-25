import type { Channel } from 'pusher-js'
import type { ScanStepStatus } from '~/constants/scan'
import { SCAN_STEP_KEYS, POLL_INTERVAL_MS, ANALYSIS_AGENTS_TOTAL } from '~/constants/scan'

interface ScanState {
  status: 'idle' | 'scanning' | 'complete' | 'failed'
  currentStep: string | null
  stepStatuses: Record<string, ScanStepStatus>
  error: string | null
  agentsCompleted: number
  agentsTotal: number
}

export function useScanProgress(auditId: Ref<string | null>) {
  const { $api } = useApi()
  const { getChannel, isConnected } = useWebSocket()

  const state = reactive<ScanState>({
    status: 'idle',
    currentStep: null,
    stepStatuses: Object.fromEntries(SCAN_STEP_KEYS.map(k => [k, 'pending' as ScanStepStatus])),
    error: null,
    agentsCompleted: 0,
    agentsTotal: ANALYSIS_AGENTS_TOTAL,
  })

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let wsListening = false

  function markStepActive(step: string) {
    for (const key of SCAN_STEP_KEYS) {
      if (key === step) {
        state.stepStatuses[key] = 'active'
        state.currentStep = step
        break
      }
      if (state.stepStatuses[key] !== 'done') {
        state.stepStatuses[key] = 'done'
      }
    }
  }

  function markComplete() {
    for (const key of SCAN_STEP_KEYS) {
      state.stepStatuses[key] = 'done'
    }
    state.status = 'complete'
    state.currentStep = null
    cleanup()
  }

  function markFailed(error: string) {
    state.status = 'failed'
    state.error = error
    if (state.currentStep) {
      state.stepStatuses[state.currentStep] = 'failed'
    }
    cleanup()
  }

  function handleAnalysisProgress(agentsCompleted: number, agentsTotal: number) {
    state.agentsCompleted = agentsCompleted
    state.agentsTotal = agentsTotal
  }

  function stopPolling() {
    if (!pollTimer) return
    clearInterval(pollTimer)
    pollTimer = null
  }

  function isForThisAudit(e: { audit_id: string }): boolean {
    return e.audit_id === auditId.value
  }

  function bindToChannel(channel: Channel) {
    channel.bind('ScanStarted', (e: { audit_id: string }) => {
      if (!isForThisAudit(e)) return
      state.status = 'scanning'
      markStepActive('validating')
      wsListening = true
      stopPolling()
    })

    channel.bind('ScanProgress', (e: { audit_id: string, step: string, agents_completed?: number, agents_total?: number }) => {
      if (!isForThisAudit(e)) return
      state.status = 'scanning'
      markStepActive(e.step)
      wsListening = true
      stopPolling()

      if (e.step === 'analyzing' && e.agents_completed != null && e.agents_total != null) {
        handleAnalysisProgress(e.agents_completed, e.agents_total)
      }
    })

    channel.bind('ScanComplete', (e: { audit_id: string }) => {
      if (!isForThisAudit(e)) return
      markComplete()
    })

    channel.bind('ScanFailed', (e: { audit_id: string, reason: string }) => {
      if (!isForThisAudit(e)) return
      markFailed(e.reason)
    })
  }

  function unbindFromChannel(channel: Channel) {
    channel.unbind('ScanStarted')
    channel.unbind('ScanProgress')
    channel.unbind('ScanComplete')
    channel.unbind('ScanFailed')
  }

  function listenOnWebSocket() {
    const channel = getChannel()
    if (!channel || !isConnected()) {
      startPolling()
      return
    }

    bindToChannel(channel)

    setTimeout(() => {
      if (!wsListening) startPolling()
    }, 5000)
  }

  async function poll() {
    if (!auditId.value || wsListening) return

    try {
      const data = await $api<{ data: { status: string } }>(`/audits/${auditId.value}/status`)
      const auditStatus = data.data.status

      if (auditStatus === 'scanning' && state.status !== 'scanning') {
        state.status = 'scanning'
        markStepActive('scanning')
      }

      if (auditStatus === 'analyzing') {
        state.status = 'scanning'
        markStepActive('analyzing')
      }

      if (auditStatus === 'complete') {
        markComplete()
      }

      if (auditStatus === 'failed') {
        markFailed('Audit failed')
      }
    }
    catch {
      // Silently retry on next poll
    }
  }

  function startPolling() {
    if (pollTimer) return
    pollTimer = setInterval(poll, POLL_INTERVAL_MS)
  }

  function start() {
    cleanup()

    state.status = 'scanning'
    state.error = null
    state.currentStep = null
    state.agentsCompleted = 0
    state.agentsTotal = ANALYSIS_AGENTS_TOTAL
    wsListening = false

    for (const key of SCAN_STEP_KEYS) {
      state.stepStatuses[key] = 'pending'
    }

    markStepActive('validating')
    listenOnWebSocket()
  }

  function cleanup() {
    stopPolling()

    const channel = getChannel()
    if (channel) {
      unbindFromChannel(channel)
    }
    wsListening = false
  }

  onUnmounted(cleanup)

  return { state, start, cleanup }
}
