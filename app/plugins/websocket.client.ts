export default defineNuxtPlugin(() => {
  // Initialize the shared WebSocket connection.
  // The composable auto-connects when authStore.user is set
  // and disconnects on logout via its internal watcher.
  useWebSocket()
})
