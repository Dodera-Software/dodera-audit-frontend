import Pusher from 'pusher-js'
import type { Channel } from 'pusher-js'

let pusherInstance: Pusher | null = null
let userChannel: Channel | null = null
let connectedUserId: string | null = null

export function useWebSocket() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function connect() {
    const userId = authStore.user?.id
    if (!userId || connectedUserId === userId) return

    disconnect()

    const key = config.public.reverbKey || 'ghostaudit-key'
    const host = config.public.reverbHost || 'localhost'
    const port = Number(config.public.reverbPort) || 8080

    try {
      pusherInstance = new Pusher(key as string, {
        cluster: 'mt1',
        wsHost: host as string,
        wsPort: port,
        wssPort: port,
        forceTLS: false,
        enabledTransports: ['ws'],
        disableStats: true,
      })

      userChannel = pusherInstance.subscribe(`user.${userId}`)
      connectedUserId = userId
    }
    catch {
      // WebSocket unavailable — features using it will fall back to polling
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
  }

  function getChannel(): Channel | null {
    return userChannel
  }

  function isConnected(): boolean {
    return !!userChannel && !!connectedUserId
  }

  // Auto-connect when user is available, disconnect on logout
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
