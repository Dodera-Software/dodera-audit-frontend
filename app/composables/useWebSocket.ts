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
        wsPort: port,
        wssPort: port,
        forceTLS: tls,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
      })

      userChannel = pusherInstance.subscribe(`user.${userId}`)
      connectedUserId = userId

      bindScanEvents(userChannel)
      bindNotificationEvents(userChannel)
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

    channel.bind('ScanProgress', (e: { audit_id: string, step: string, pass?: number, pass_total?: number, pass_name?: string }) => {
      scanStore.handleScanProgress(e.audit_id, e.step, e.pass, e.pass_total, e.pass_name)
    })

    channel.bind('ScanExplorationStep', (e: { audit_id: string, step_number: number, max_steps: number, action: string, description: string, screenshot_thumbnail?: string | null, finding_count: number, finding?: { category: string, severity: string, title: string } | null }) => {
      scanStore.handleExplorationStep(e.audit_id, e)
    })

    channel.bind('ScanComplete', (e: { audit_id: string }) => {
      scanStore.handleScanComplete(e.audit_id)
    })

    channel.bind('ScanFailed', (e: { audit_id: string, reason: string }) => {
      scanStore.handleScanFailed(e.audit_id, e.reason)
    })
  }

  function bindNotificationEvents(channel: Channel) {
    const notificationsStore = useNotificationsStore()

    channel.bind('NotificationReceived', (payload: {
      id: string
      type?: string | null
      title?: string | null
      body?: string | null
      icon?: string | null
      link?: string | null
      meta?: Record<string, unknown> | null
    }) => {
      notificationsStore.prependFromWs(payload)
    })
  }

  function getChannel(): Channel | null {
    return userChannel
  }

  function isConnected(): boolean {
    return !!userChannel && !!connectedUserId
  }

  watch(() => authStore.user, (user) => {
    const notificationsStore = useNotificationsStore()

    if (user) {
      connect()
      notificationsStore.fetchUnreadCount()
    }
    else {
      disconnect()
      notificationsStore.reset()
    }
  }, { immediate: true })

  return { connect, disconnect, getChannel, isConnected }
}
