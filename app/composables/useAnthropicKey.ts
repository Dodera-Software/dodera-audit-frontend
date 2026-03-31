export interface AnthropicKeyStatus {
  has_key: boolean
  model: string | null
  model_label: string | null
  available_models: { value: string; label: string }[]
  can_configure: boolean
}

const keyStatus = ref<AnthropicKeyStatus | null>(null)
const loading = ref(false)
const saving = ref(false)

export function useAnthropicKey() {
  const { $api } = useApi()

  async function fetchStatus(): Promise<void> {
    loading.value = true
    try {
      keyStatus.value = await $api<AnthropicKeyStatus>('/user/anthropic-key')
    }
    finally {
      loading.value = false
    }
  }

  async function saveKey(apiKey: string, model?: string): Promise<void> {
    saving.value = true
    try {
      keyStatus.value = await $api<AnthropicKeyStatus>('/user/anthropic-key', {
        method: 'POST',
        body: { api_key: apiKey, model: model || null },
      })
    }
    finally {
      saving.value = false
    }
  }

  async function removeKey(): Promise<void> {
    saving.value = true
    try {
      await $api('/user/anthropic-key', { method: 'DELETE' })
      keyStatus.value = keyStatus.value
        ? { ...keyStatus.value, has_key: false, model: null, model_label: null }
        : null
    }
    finally {
      saving.value = false
    }
  }

  return {
    keyStatus: readonly(keyStatus),
    loading: readonly(loading),
    saving: readonly(saving),
    fetchStatus,
    saveKey,
    removeKey,
  }
}
