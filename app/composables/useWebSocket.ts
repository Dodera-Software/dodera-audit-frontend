import Pusher from 'pusher-js'
import type { Channel } from 'pusher-js'

let pusherInstance: Pusher | null = null
let userChannel: Channel | null = null
let connectedUserId: string | null = null
let eventsBound = false

export function useWebSocket() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function connect() {
    const userId = authStore.user?.id
    if (!userId || connectedUserId === userId) return

    disconnect()

    const key = config.public.reverbKey || 'pawbytech-key'
    const host = config.public.reverbHost || 'localhost'
    const port = Number(config.public.reverbPort) || 8080
    const scheme = config.public.reverbScheme || 'ws'
    const tls = scheme === 'wss'

    try {
      pusherInstance = new Pusher(key as string, {
        cluster: 'mt1',
        wsHost: host as string,
        wsPort: tls ? undefined : port,
        wssPort: tls ? port : undefined,
        forceTLS: tls,
        enabledTransports: [tls ? 'wss' : 'ws'],
        disableStats: true,
      })

      userChannel = pusherInstance.subscribe(`user.${userId}`)
      connectedUserId = userId

      bindScanEvents(userChannel)
    }
    catch {
      // WebSocket unavailable
    }
  }

  function disconnect() {
    if (userChannel) {
      try { userChannel.unbind_all() } catch {}
      userChannel = null
    }
    if (pusherInstance) {
      try { pusherInstance.disconnect() } catch {}
      pusherInstance = null
    }
    connectedUserId = null
    eventsBound = false
  }

  function bindScanEvents(channel: Channel) {
    if (eventsBound) return
    eventsBound = true

    const scanStore = useScanProgressStore()

    channel.bind('ScanStarted', (e: { audit_id: string }) => {
      scanStore.handleScanStarted(e.audit_id)
    })

    channel.bind('ScanProgress', (e: { audit_id: string, step: string, agents_completed?: number, agents_total?: number }) => {
      scanStore.handleScanProgress(e.audit_id, e.step, e.agents_completed, e.agents_total)
    })

    channel.bind('ScanComplete', (e: { audit_id: string }) => {
      scanStore.handleScanComplete(e.audit_id)
    })

    channel.bind('ScanFailed', (e: { audit_id: string, reason: string }) => {
      scanStore.handleScanFailed(e.audit_id, e.reason)
    })
  }

  function getChannel(): Channel | null {
    return userChannel
  }

  function isConnected(): boolean {
    return !!userChannel && !!connectedUserId
  }

  watch(() => authStore.user, (user) => {
    if (user) {
      connect()
    }
    else {
      disconnect()
    }
  }, { immediate: true })

  return { connect, disconnect, getChannel, isConnected }
}
