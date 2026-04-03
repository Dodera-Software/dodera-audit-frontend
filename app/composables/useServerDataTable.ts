import type { PaginationMeta } from '~/components/BaseDataTable.vue'

interface ServerDataTableOptions {
  /** API endpoint path, e.g. '/admin/users' */
  endpoint: string | Ref<string> | ComputedRef<string>
  /** Items per page (default: 25) */
  perPage?: number
  /** Reactive filter values — keys become query params, empty strings are omitted */
  filters?: Record<string, Ref<string> | ComputedRef<string>>
  /** Error toast message shown on fetch failure */
  errorMessage?: string
  /** Whether to fetch immediately on creation (default: true) */
  immediate?: boolean
  /** Whether to watch filters and refetch on change (default: true) */
  watchFilters?: boolean
}

/**
 * Composable that encapsulates all server-side data table state:
 * pagination, search, loading, filtering, and fetching.
 *
 * Eliminates the repetitive boilerplate of pagination/search/loading
 * that every BaseDataTable consumer otherwise duplicates.
 */
export function useServerDataTable<T = any>(options: ServerDataTableOptions) {
  const { $api } = useApi()
  const toast = useToast()
  const apiError = useApiError()
  const { t } = useI18n()

  const perPage = options.perPage ?? 25
  const errorMessage = options.errorMessage ?? t('Failed to load data.')

  const rows = ref<T[]>([]) as Ref<T[]>
  const loading = ref(options.immediate !== false)
  const tableLoading = ref(false)
  const searchQuery = ref('')

  const paginationMeta = ref<PaginationMeta>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  })

  const resolvedEndpoint = computed(() =>
    typeof options.endpoint === 'string' ? options.endpoint : unref(options.endpoint),
  )

  async function fetch(page = 1) {
    tableLoading.value = true
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      })

      if (searchQuery.value) {
        params.set('search', searchQuery.value)
      }

      if (options.filters) {
        for (const [key, valueRef] of Object.entries(options.filters)) {
          const val = unref(valueRef)
          if (val && val !== 'all') {
            params.set(key, val)
          }
        }
      }

      const data = await $api<any>(`${resolvedEndpoint.value}?${params}`)

      rows.value = data.data
      paginationMeta.value = {
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
        total: data.meta.total,
        from: data.meta.from || 0,
        to: data.meta.to || 0,
      }
    }
    catch (e: any) {
      toast.add({ title: apiError.parse(e, errorMessage).message, color: 'error' })
    }
    finally {
      tableLoading.value = false
    }
  }

  function onSearch(query: string) {
    searchQuery.value = query
    fetch(1)
  }

  function onPageChange(page: number) {
    fetch(page)
  }

  function onRefresh() {
    fetch(paginationMeta.value.currentPage)
  }

  // Watch filters and refetch on change
  if (options.filters && options.watchFilters !== false) {
    const filterRefs = Object.values(options.filters)
    watch(filterRefs, () => fetch(1))
  }

  // Initial fetch
  if (options.immediate !== false) {
    onMounted(async () => {
      await fetch()
      loading.value = false
    })
  }

  return {
    /** Row data from the API */
    rows,
    /** True until the first fetch completes — use for skeleton loading */
    loading,
    /** True during any fetch — use for table overlay */
    tableLoading,
    /** Current pagination state */
    paginationMeta,
    /** Current search query */
    searchQuery,
    /** Fetch a specific page */
    fetch,
    /** Search handler — resets to page 1 */
    onSearch,
    /** Page change handler */
    onPageChange,
    /** Refresh current page */
    onRefresh,
  }
}
