const MIN_WIDTH = 160
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 256
const TEXT_THRESHOLD = 155

export function useSidebarState() {
    const isCollapsed = useState<boolean>('sidebar-collapsed', () => false)
    const sidebarWidth = useState<number>('sidebar-width', () => DEFAULT_WIDTH)

    const isTextVisible = computed(() => sidebarWidth.value >= TEXT_THRESHOLD)

    function toggle(): void {
        isCollapsed.value = !isCollapsed.value
    }

    function startResize(e: MouseEvent): void {
        const startX = e.clientX
        const startWidth = sidebarWidth.value

        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'ew-resize'

        function onMouseMove(event: MouseEvent): void {
            sidebarWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + event.clientX - startX))
        }

        function onMouseUp(): void {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    return { isCollapsed, sidebarWidth, isTextVisible, toggle, startResize }
}
