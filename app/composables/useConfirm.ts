interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  color?: 'primary' | 'error' | 'warning'
  icon?: string
}

interface ConfirmState {
  open: boolean
  options: ConfirmOptions
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  open: false,
  options: { title: '' },
  resolve: null,
})

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    state.options = options
    state.open = true

    return new Promise<boolean>((resolve) => {
      state.resolve = resolve
    })
  }

  function handleConfirm() {
    state.open = false
    state.resolve?.(true)
    state.resolve = null
  }

  function handleCancel() {
    state.open = false
    state.resolve?.(false)
    state.resolve = null
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
