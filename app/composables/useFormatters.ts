import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { enUS } from 'date-fns/locale'

export function useFormatters() {
  const { locale } = useI18n()

  function getDateLocale() {
    // Extend this map when adding new locales
    const localeMap: Record<string, typeof enUS> = {
      en: enUS,
    }
    return localeMap[locale.value] ?? enUS
  }

  function formatDate(iso: string): string {
    return format(parseISO(iso), 'PP', { locale: getDateLocale() })
  }

  function formatDateTime(iso: string): string {
    return format(parseISO(iso), 'PPp', { locale: getDateLocale() })
  }

  function formatRelativeDate(iso: string): string {
    return formatDistanceToNow(parseISO(iso), {
      addSuffix: true,
      locale: getDateLocale(),
    })
  }

  function formatDuration(seconds: number): string {
    if (seconds <= 0) return '...'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  function formatMs(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  function hostname(url: string): string {
    try { return new URL(url).hostname }
    catch { return url }
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return { formatDate, formatDateTime, formatRelativeDate, formatDuration, formatMs, hostname, getInitials }
}
