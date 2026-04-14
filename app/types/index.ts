/**
 * Possible states of an audit run.
 */
export enum AuditStatus {
    Pending = 'pending',
    Scanning = 'scanning',
    Analyzing = 'analyzing',
    Complete = 'complete',
    Failed = 'failed',
}

/**
 * Nuxt UI badge/button color union — matches what UBadge and UButton accept for the :color prop.
 */
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
