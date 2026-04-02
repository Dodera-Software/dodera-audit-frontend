import { z } from 'zod'

export function usePasswordForm() {
    const { t } = useI18n()
    const { $api } = useApi()

    const error = useApiError()
    const loading = ref(false)
    const success = ref(false)

    const schema = z.object({
        current_password: z.string().min(1, t('Current password is required')),
        password: z.string().min(8, t('Password must be at least 8 characters')),
        password_confirmation: z.string().min(1, t('Confirm your password')),
    }).refine(data => data.password === data.password_confirmation, {
        message: t('Passwords do not match'),
        path: ['password_confirmation'],
    })

    const form = reactive({
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    async function submit() {
        loading.value = true
        error.clear()
        success.value = false

        try {
            await $api('/user/password', { method: 'PATCH', body: form })
            form.current_password = ''
            form.password = ''
            form.password_confirmation = ''
            success.value = true
        }
        catch (e) {
            error.parse(e, t('Failed to update password.'))
        }
        finally {
            loading.value = false
        }
    }

    return { error, loading, success, schema, form, submit }
}
