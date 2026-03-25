import type { Channel } from 'pusher-js'
import type { ScanStepStatus } from '~/constants/scan'
import { SCAN_STEP_KEYS, ESTIMATED_STEP_SECONDS, TOTAL_ESTIMATED_SECONDS, POLL_INTERVAL_MS, ANALYSIS_AGENTS_TOTAL } from '~/constants/scan'

interface ScanState {
  status: 'idle' | 'scanning' | 'complete' | 'failed'
  currentStep: string | null
  stepStatuses: Record<string, ScanStepStatus>
  error: string | null
  estimatedSecondsRemaining: number
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
    estimatedSecondsRemaining: TOTAL_ESTIMATED_SECONDS,
    agentsCompleted: 0,
    agentsTotal: ANALYSIS_AGENTS_TOTAL,
  })

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let wsListening = false

  // Track agent timing for accurate estimates
  let analysisStartTime: number | null = null
  let lastAgentCompletedAt: number | null = null

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
    updateEstimate()
  }

  function markComplete() {
    for (const key of SCAN_STEP_KEYS) {
      state.stepStatuses[key] = 'done'
    }
    state.status = 'complete'
    state.currentStep = null
    state.estimatedSecondsRemaining = 0
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

  function updateEstimate() {
    if (state.currentStep === 'analyzing' && state.agentsCompleted > 0 && analysisStartTime) {
      const elapsedMs = Date.now() - analysisStartTime
      const avgPerAgent = elapsedMs / state.agentsCompleted
      const remainingAgents = state.agentsTotal - state.agentsCompleted
      const estimatedAnalysisRemaining = (avgPerAgent * remainingAgents) / 1000
      const assemblingTime = ESTIMATED_STEP_SECONDS.assembling ?? 5

      state.estimatedSecondsRemaining = Math.max(0, Math.round(estimatedAnalysisRemaining + assemblingTime))
      return
    }

    let remaining = 0
    let foundCurrent = false

    for (const key of SCAN_STEP_KEYS) {
      if (key === state.currentStep) {
        remaining += (ESTIMATED_STEP_SECONDS[key] ?? 0) / 2
        foundCurrent = true
        continue
      }
      if (foundCurrent) {
        remaining += (ESTIMATED_STEP_SECONDS[key] ?? 0)
      }
    }

    state.estimatedSecondsRemaining = Math.max(0, Math.round(remaining))
  }

  function handleAnalysisProgress(agentsCompleted: number, agentsTotal: number) {
    if (!analysisStartTime) {
      analysisStartTime = Date.now()
    }

    state.agentsCompleted = agentsCompleted
    state.agentsTotal = agentsTotal
    lastAgentCompletedAt = Date.now()
    updateEstimate()
  }

  function startCountdown() {
    stopCountdown()
    countdownTimer = setInterval(() => {
      if (state.estimatedSecondsRemaining > 0) {
        state.estimatedSecondsRemaining--
      }
    }, 1000)
  }

  function stopCountdown() {
    if (!countdownTimer) return
    clearInterval(countdownTimer)
    countdownTimer = null
  }

  function stopPolling() {
    if (!pollTimer) return
    clearInterval(pollTimer)
    pollTimer = null
  }

  // Filter events by audit_id since the channel is shared across all user audits
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

    // Fallback to polling if no WS event within 5s
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
    state.estimatedSecondsRemaining = TOTAL_ESTIMATED_SECONDS
    state.agentsCompleted = 0
    state.agentsTotal = ANALYSIS_AGENTS_TOTAL
    wsListening = false
    analysisStartTime = null
    lastAgentCompletedAt = null

    for (const key of SCAN_STEP_KEYS) {
      state.stepStatuses[key] = 'pending'
    }

    markStepActive('validating')
    listenOnWebSocket()
    startCountdown()
  }

  function cleanup() {
    stopPolling()
    stopCountdown()

    const channel = getChannel()
    if (channel) {
      unbindFromChannel(channel)
    }
    wsListening = false
  }

  onUnmounted(cleanup)

  return { state, start, cleanup }
}
