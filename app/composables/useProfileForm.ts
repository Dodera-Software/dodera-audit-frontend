import { z } from 'zod'

export function useProfileForm() {
    const { t } = useI18n()
    const { $api } = useApi()
    const { fetchMe } = useAuth()
    const authStore = useAuthStore()

    const error = useApiError()
    const loading = ref(false)
    const success = ref(false)

    const schema = z.object({
        name: z.string().min(1, t('Name is required')).max(255),
    })

    const form = reactive({
        name: '',
    })

    // Keep form in sync with the store — handles initial load, navigation back,
    // and any other code path that calls fetchMe and updates the store.
    watch(
        () => authStore.user,
        (user) => {
            if (!user) return
            form.name = user.name
        },
        { immediate: true },
    )

    async function submit() {
        loading.value = true
        error.clear()
        success.value = false

        // Snapshot before the async chain — fetchMe() may overwrite the store
        // which triggers the watch and resets form values before we can re-apply them.
        const savedName = form.name

        try {
            await $api('/user', { method: 'PATCH', body: form })
            await fetchMe()

            // Always restore the saved name into the store so the hero card
            // reflects what the user just saved, regardless of what /me returns.
            if (authStore.user) {
                authStore.setUser({
                    ...authStore.user,
                    name: savedName,
                })
            }

            success.value = true
        }
        catch (e) {
            error.parse(e, t('Failed to update profile.'))
        }
        finally {
            loading.value = false
        }
    }

    return { error, loading, success, schema, form, submit }
}
