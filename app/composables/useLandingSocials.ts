export interface SocialLink {
    label: string
    href: string
    icon: string
}

export function useLandingSocials(): SocialLink[] {
    return [
        { label: 'LinkedIn', href: '#', icon: 'i-simple-icons-linkedin' },
        { label: 'X (Twitter)', href: '#', icon: 'i-simple-icons-x' },
        { label: 'Instagram', href: '#', icon: 'i-simple-icons-instagram' },
    ]
}
