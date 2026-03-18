import { defineStore } from 'pinia'

interface Audit {
  id: string
  status: string
  trigger_type: string
  overall_score: number | null
  scores: Record<string, number> | null
  created_at: string
  completed_at: string | null
}

export const useAuditStore = defineStore('audit', {
  state: () => ({
    audits: [] as Audit[],
    current: null as Audit | null,
    loading: false,
  }),

  actions: {
    setAudits(audits: Audit[]) {
      this.audits = audits
    },

    setCurrent(audit: Audit | null) {
      this.current = audit
    },
  },
})
