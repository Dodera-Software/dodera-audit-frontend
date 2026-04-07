import type { Config, Driver, DriveStep, State } from 'driver.js'
import { useTutorialStore } from '~/stores/tutorial'

type StepCallbackOptions = { config: Config; state: State; driver: Driver }

// Shared config applied to both tour phases
const DRIVER_BASE_CONFIG = {
    showProgress: true,
    progressText: '{{current}} / {{total}}',
    popoverClass: 'pbt-tour-popover',
    animate: true,
    smoothScroll: true,
    overlayOpacity: 0.62,
    stagePadding: 8,
    stageRadius: 8,
} as const

// Resolves only once the selector exists in the DOM
function waitForElement(selector: string): Promise<void> {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) { resolve(); return }
        const observer = new MutationObserver(() => {
            if (!document.querySelector(selector)) return
            observer.disconnect()
            resolve()
        })
        observer.observe(document.body, { childList: true, subtree: true })
    })
}

// Filters out steps whose target element is absent from the DOM
function filterPresentSteps(steps: DriveStep[]): DriveStep[] {
    return steps.filter(step =>
        typeof step.element !== 'string' || !!document.querySelector(step.element),
    )
}

export function useTutorial() {
    const tutorialStore = useTutorialStore()
    const { showWelcome, tutorialActive } = storeToRefs(tutorialStore)
    const { t } = useI18n()
    const toast = useToast()

    // ─── Phase 2: walk through the Add Page form ───────────────────────────
    async function startFormTour(): Promise<void> {
        const { driver } = await import('driver.js')

        const steps = filterPresentSteps([
            {
                element: '[data-tutorial="form-url"]',
                popover: {
                    title: t('1 · Enter your page URL'),
                    description: t('Paste the full URL of any public page — a homepage, landing page, product page, or blog post. PawByTech audits one page at a time, not your whole website.'),
                    side: 'bottom',
                    align: 'start',
                },
            },
            {
                element: '[data-tutorial="form-project"]',
                popover: {
                    title: t('2 · Choose a project'),
                    description: t('Projects are folders that group pages from the same website. Pick an existing project or click "+ New" to create one right now.'),
                    side: 'bottom',
                    align: 'start',
                },
            },
            {
                element: '[data-tutorial="form-ai-fields"]',
                popover: {
                    title: t('3 · Help the AI understand your page'),
                    description: t('Select your site type, conversion goal, and target audience. This context lets the AI tailor every finding specifically to your page — it makes a big difference.'),
                    side: 'top',
                    align: 'start',
                },
            },
            {
                element: '[data-tutorial="form-submit"]',
                popover: {
                    title: t('4 · Launch your first audit 🚀'),
                    description: t('Fill in the URL above and click "Add page". PawByTech will spin up our AI agents to analyze your page — your full report arrives in under 3 minutes.'),
                    side: 'top',
                    align: 'end',
                    showButtons: ['previous', 'close'],
                },
            },
        ])

        driver({
            ...DRIVER_BASE_CONFIG,
            nextBtnText: t('Next →'),
            prevBtnText: t('← Back'),
            doneBtnText: t('Got it ✓'),
            steps,
            onDestroyed: () => {
                tutorialStore.tutorialActive = false
                tutorialStore.markCompleted()
                toast.add({
                    title: t("You're all set!"),
                    description: t('Fill in the URL and click "Add page" to launch your first audit.'),
                    color: 'success',
                    icon: 'i-lucide-rocket',
                })
            },
        }).drive()
    }

    // ─── Phase 1: sidebar nav → "Audit your first page" button ────────────
    async function startTour(): Promise<void> {
        tutorialStore.showWelcome = false
        tutorialStore.tutorialActive = true

        if (import.meta.client && window.location.pathname !== '/dashboard') {
            await navigateTo('/dashboard')
        }
        await nextTick()

        await Promise.race([
            waitForElement('[data-tutorial="audit-first-page-btn"]'),
            new Promise<void>(resolve => setTimeout(resolve, 5000)),
        ])

        const { driver } = await import('driver.js')

        let transitioning = false
        let buttonClickHandler: EventListener | null = null

        function cleanupButtonListener(): void {
            if (!buttonClickHandler) return
            document.querySelector('[data-tutorial="audit-first-page-btn"]')
                ?.removeEventListener('click', buttonClickHandler)
            buttonClickHandler = null
        }

        const steps = filterPresentSteps([
            {
                element: '[data-tutorial="nav-dashboard"]',
                popover: {
                    title: t('Your Dashboard'),
                    description: t('This is your command center. See all your recent pages, audit scores and activity — everything in one place.'),
                    side: 'right',
                    align: 'center',
                },
            },
            {
                element: '[data-tutorial="nav-projects"]',
                popover: {
                    title: t('Projects'),
                    description: t('Projects group pages from the same website. PawByTech audits one page at a time, not your whole website. For example, create a "My Website" project, then add individual pages inside it to audit. You\'ll create one in just a moment.'),
                    side: 'right',
                    align: 'center',
                },
            },
            {
                element: '[data-tutorial="audit-first-page-btn"]',
                popover: {
                    title: t('Audit your first page'),
                    description: t('Click the button to add a page URL and kick off your first AI audit. The AI will handle everything from there. Go ahead — click it! 👇'),
                    side: 'top',
                    align: 'center',
                    showButtons: ['close'],
                },
                onHighlighted: (_el: Element | undefined, _step: DriveStep, { driver: drv }: StepCallbackOptions) => {
                    const btn = document.querySelector('[data-tutorial="audit-first-page-btn"]')
                    if (!btn) return

                    buttonClickHandler = async () => {
                        transitioning = true
                        cleanupButtonListener()
                        drv.destroy()
                        await waitForElement('[data-tutorial="form-url"]')
                        await nextTick()
                        startFormTour()
                    }

                    btn.addEventListener('click', buttonClickHandler, { once: true })
                },
                onDeselected: () => cleanupButtonListener(),
            },
        ])

        driver({
            ...DRIVER_BASE_CONFIG,
            nextBtnText: t('Next →'),
            prevBtnText: t('← Back'),
            doneBtnText: t("Let's go!"),
            steps,
            onDestroyed: () => {
                if (transitioning) return
                tutorialStore.tutorialActive = false
                cleanupButtonListener()
            },
        }).drive()
    }

    return { showWelcome, tutorialActive, startTour }
}

