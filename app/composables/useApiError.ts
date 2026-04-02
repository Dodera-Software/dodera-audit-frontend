interface ApiError {
  message: string
  errors: Record<string, string[]>
  status: number
}

export function useApiError() {
  const error = ref<ApiError | null>(null)

  function clear() {
    error.value = null
  }

  function parse(e: unknown, fallbackMessage?: string): ApiError {
    const err = e as { response?: { status?: number, _data?: { message?: string, errors?: Record<string, string[]> } }, status?: number, data?: { message?: string, errors?: Record<string, string[]> }, message?: string }
    const status = err?.response?.status || err?.status || 500
    const data = err?.data || err?.response?._data || {}

    const parsed: ApiError = {
      message: data.message || err?.message || fallbackMessage || 'Something went wrong.',
      errors: data.errors || {},
      status,
    }

    error.value = parsed
    return parsed
  }

  const message = computed(() => error.value?.message || '')

  const firstError = computed(() => {
    if (!error.value?.errors) return ''
    const allErrors = Object.values(error.value.errors).flat()
    return allErrors[0] || ''
  })

  const displayMessage = computed(() => firstError.value || message.value)

  const hasErrors = computed(() => !!error.value)

  function fieldError(field: string): string {
    return error.value?.errors?.[field]?.[0] || ''
  }

  return {
    error,
    message,
    firstError,
    displayMessage,
    hasErrors,
    clear,
    parse,
    fieldError,
  }
}
