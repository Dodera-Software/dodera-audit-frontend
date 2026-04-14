interface NavbarConfig {
    title?: string
    subtitle?: string
    showBack?: boolean
    backTo?: string
    hidden?: boolean
}

const _state = reactive<NavbarConfig>({
    title: undefined,
    subtitle: undefined,
    showBack: false,
    backTo: undefined,
    hidden: false,
})

function getPreviousRoutePath(): string | undefined {
    if (!import.meta.client) return undefined
    return window.history.state?.back as string | undefined
}

export function usePageNavbar() {
    function setNavbar(config: NavbarConfig): void {
        _state.title = config.title
        _state.subtitle = config.subtitle
        _state.showBack = config.showBack ?? false
        _state.backTo = getPreviousRoutePath() ?? config.backTo
        _state.hidden = config.hidden ?? false
    }

    return {
        navbarState: readonly(_state) as Readonly<NavbarConfig>,
        setNavbar,
    }
}
