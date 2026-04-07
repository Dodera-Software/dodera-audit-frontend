import { defineStore } from 'pinia'

export const useTutorialStore = defineStore('tutorial', () => {
    const showWelcome = ref(false)
    const tutorialActive = ref(false)

    function tutorialKey(): string | null {
        const authStore = useAuthStore()
        if (!authStore.user) return null
        return `pbt:tutorial:${authStore.user.id}`
    }

    function isCompleted(): boolean {
        if (!import.meta.client) return true
        const key = tutorialKey()
        if (!key) return false
        return localStorage.getItem(key) === 'done'
    }

    function markCompleted(): void {
        if (!import.meta.client) return
        const key = tutorialKey()
        if (key) localStorage.setItem(key, 'done')
    }

    function checkFirstVisit(): void {
        if (!import.meta.client) return
        if (isCompleted()) return
        showWelcome.value = true
    }

    function dismiss(): void {
        showWelcome.value = false
        tutorialActive.value = false
        markCompleted()
    }

    function restart(): void {
        if (!import.meta.client) return
        const key = tutorialKey()
        if (key) localStorage.removeItem(key)
        showWelcome.value = true
    }

    return { showWelcome, tutorialActive, checkFirstVisit, dismiss, restart, markCompleted }
})
