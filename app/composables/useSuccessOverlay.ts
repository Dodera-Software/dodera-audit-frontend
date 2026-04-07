export function useSuccessOverlay() {
    const show = useState<boolean>('successOverlay.show', () => false)
    const title = useState<string>('successOverlay.title', () => '')
    const subtitle = useState<string>('successOverlay.subtitle', () => '')

    function showOverlay(opts: { title: string, subtitle: string }, duration = 1800) {
        title.value = opts.title
        subtitle.value = opts.subtitle
        show.value = true
        setTimeout(() => {
            show.value = false
        }, duration)
    }

    return { show, title, subtitle, showOverlay }
}
