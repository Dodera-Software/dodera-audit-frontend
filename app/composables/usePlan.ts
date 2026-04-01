export interface BillingStatus {
  plan: 'free' | 'pro' | 'max'
  plan_label: string
  audits_this_month: number
  audit_limit: number
  project_limit: number
  included_seats: number
  extra_seats: number
  total_seats: number
  subscription_status: string | null
  subscription_ends_at: string | null
  on_grace_period: boolean
  has_stripe_account: boolean
  has_own_api_key: boolean
  openai_model: string | null
  unlimited_audits: boolean
}

export interface PlanInfo {
  name: string
  price_cents: number
  interval: string | null
  audit_limit: number
  project_limit: number
  included_seats: number
  extra_seat_price_cents: number
  stripe_price_id?: string
  features: string[]
  locked: string[]
}

// Number of issues free users can see without blurring
export const FREE_ISSUE_LIMIT = 3

const billingStatus = ref<BillingStatus | null>(null)
const billingLoading = ref(false)
const billingFetched = ref(false)

export function usePlan() {
  const authStore = useAuthStore()
  const { $api } = useApi()

  const user = computed(() => authStore.user)
  const plan = computed(() => user.value?.plan ?? 'free')

  const isFree = computed(() => plan.value === 'free')
  const isPro = computed(() => plan.value === 'pro')
  const isMax = computed(() => plan.value === 'max')
  const isPaid = computed(() => plan.value !== 'free')

  // Feature gates
  const canSeePersonaInsights = computed(() => isPaid.value)
  const canSeeAiSuggestions = computed(() => isPaid.value)
  const canSeeBrainNarrative = computed(() => isPaid.value)

  // Limits derived from billing status (falls back to plan defaults if not loaded)
  const auditsThisMonth = computed(() => billingStatus.value?.audits_this_month ?? 0)
  const auditLimit = computed(() => billingStatus.value?.audit_limit ?? (isFree.value ? 1 : isPro.value ? 5 : 50))
  const unlimitedAudits = computed(() => billingStatus.value?.unlimited_audits ?? false)
  const canAudit = computed(() => unlimitedAudits.value || auditsThisMonth.value < auditLimit.value)
  const auditUsagePercent = computed(() => unlimitedAudits.value ? 0 : Math.min(100, Math.round((auditsThisMonth.value / auditLimit.value) * 100)))

  async function fetchBillingStatus(): Promise<void> {
    if (billingFetched.value || billingLoading.value || !user.value) return
    billingLoading.value = true
    try {
      billingStatus.value = await $api<BillingStatus>('/billing/status')
      billingFetched.value = true
    }
    catch {
      // Billing status is best-effort; don't block the UI
    }
    finally {
      billingLoading.value = false
    }
  }

  function invalidateBillingStatus(): void {
    billingFetched.value = false
    billingStatus.value = null
  }

  async function redirectToCheckout(targetPlan: 'pro' | 'max', extraSeats = 0): Promise<void> {
    const data = await $api<{ checkout_url: string }>('/billing/checkout', {
      method: 'POST',
      body: { plan: targetPlan, seats: extraSeats },
    })
    window.location.href = data.checkout_url
  }

  async function redirectToPortal(): Promise<void> {
    const data = await $api<{ portal_url: string }>('/billing/portal')
    window.location.href = data.portal_url
  }

  async function purchaseSeats(quantity: number): Promise<void> {
    await $api<{ message: string }>('/billing/seats', {
      method: 'POST',
      body: { quantity },
    })
    invalidateBillingStatus()
  }

  return {
    // Plan identity
    plan,
    isFree,
    isPro,
    isMax,
    isPaid,

    // Feature gates
    canSeePersonaInsights,
    canSeeAiSuggestions,
    canSeeBrainNarrative,

    // Usage
    auditsThisMonth,
    auditLimit,
    unlimitedAudits,
    canAudit,
    auditUsagePercent,

    // Billing status (detailed)
    billingStatus: readonly(billingStatus),
    billingLoading: readonly(billingLoading),

    // Constants
    FREE_ISSUE_LIMIT,

    // Actions
    fetchBillingStatus,
    invalidateBillingStatus,
    redirectToCheckout,
    redirectToPortal,
    purchaseSeats,
  }
}
