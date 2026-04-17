import { defineStore } from 'pinia'

export interface AppNotification {
  id: string
  type: string | null
  title: string | null
  body: string | null
  icon: string | null
  link: string | null
  meta: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

interface State {
  items: AppNotification[]
  unreadCount: number
  loading: boolean
  loaded: boolean
  nextPage: number | null
}

interface PaginatedResponse<T> {
  data: T[]
  meta: { current_page: number, last_page: number, per_page: number, total: number }
}

interface UnreadCountResponse { unread_count: number }
interface MarkReadResponse { notification: AppNotification, unread_count: number }
interface MarkAllReadResponse { marked_read: number, unread_count: number }
interface DestroyResponse { unread_count: number }

export const useNotificationsStore = defineStore('notifications', {
  state: (): State => ({
    items: [],
    unreadCount: 0,
    loading: false,
    loaded: false,
    nextPage: 1,
  }),

  getters: {
    hasMore: (state) => state.nextPage !== null,
    unread: (state) => state.items.filter((n) => !n.read_at),
  },

  actions: {
    /**
     * Fetch page 1 from the server and merge with any items already in memory
     * (e.g. pushed over WebSocket before the bell was opened). Items are kept
     * deduped by id and sorted newest-first on every call.
     */
    async fetchFirstPage() {
      if (this.loading) return

      const { $api } = useApi()
      this.loading = true
      try {
        const res = await $api<PaginatedResponse<AppNotification>>(
          `/notifications?page=1&per_page=20`,
        )

        const byId = new Map<string, AppNotification>()
        for (const item of this.items) byId.set(item.id, item)
        for (const item of res.data) byId.set(item.id, item)

        this.items = Array.from(byId.values()).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )

        this.nextPage = res.meta.current_page < res.meta.last_page ? res.meta.current_page + 1 : null
        this.loaded = true
      }
      catch {
        // bell stays usable; retry on next open
      }
      finally {
        this.loading = false
      }
    },

    async fetchNextPage() {
      if (this.loading || this.nextPage === null) return

      const { $api } = useApi()
      this.loading = true
      try {
        const page = this.nextPage
        const res = await $api<PaginatedResponse<AppNotification>>(
          `/notifications?page=${page}&per_page=20`,
        )

        const existingIds = new Set(this.items.map((n) => n.id))
        for (const item of res.data) {
          if (!existingIds.has(item.id)) this.items.push(item)
        }

        this.nextPage = res.meta.current_page < res.meta.last_page ? res.meta.current_page + 1 : null
        this.loaded = true
      }
      catch {
        // surface silently — bell stays usable; retry on next open
      }
      finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      const { $api } = useApi()
      try {
        const res = await $api<UnreadCountResponse>('/notifications/unread-count')
        this.unreadCount = res.unread_count
      }
      catch {
        // ignore; keep last known count
      }
    },

    async markRead(id: string) {
      const item = this.items.find((n) => n.id === id)
      if (item && !item.read_at) {
        item.read_at = new Date().toISOString()
        if (this.unreadCount > 0) this.unreadCount--
      }

      const { $api } = useApi()
      try {
        const res = await $api<MarkReadResponse>(`/notifications/${id}/read`, { method: 'POST' })
        this.unreadCount = res.unread_count
        const idx = this.items.findIndex((n) => n.id === id)
        if (idx !== -1) this.items[idx] = res.notification
      }
      catch {
        // keep optimistic state; next fetch will reconcile
      }
    },

    async markAllRead() {
      const now = new Date().toISOString()
      for (const n of this.items) if (!n.read_at) n.read_at = now
      this.unreadCount = 0

      const { $api } = useApi()
      try {
        const res = await $api<MarkAllReadResponse>('/notifications/read-all', { method: 'POST' })
        this.unreadCount = res.unread_count
      }
      catch {
        // optimistic state retained
      }
    },

    async remove(id: string) {
      const before = this.items.find((n) => n.id === id)
      this.items = this.items.filter((n) => n.id !== id)
      if (before && !before.read_at && this.unreadCount > 0) this.unreadCount--

      const { $api } = useApi()
      try {
        const res = await $api<DestroyResponse>(`/notifications/${id}`, { method: 'DELETE' })
        this.unreadCount = res.unread_count
      }
      catch {
        // ignore
      }
    },

    prependFromWs(payload: {
      id: string
      type?: string | null
      title?: string | null
      body?: string | null
      icon?: string | null
      link?: string | null
      meta?: Record<string, unknown> | null
    }) {
      if (this.items.some((n) => n.id === payload.id)) return

      const notification: AppNotification = {
        id: payload.id,
        type: payload.type ?? null,
        title: payload.title ?? null,
        body: payload.body ?? null,
        icon: payload.icon ?? null,
        link: payload.link ?? null,
        meta: payload.meta ?? null,
        read_at: null,
        created_at: new Date().toISOString(),
      }

      this.items.unshift(notification)
      this.unreadCount++
    },

    reset() {
      this.items = []
      this.unreadCount = 0
      this.loading = false
      this.loaded = false
      this.nextPage = 1
    },
  },
})
