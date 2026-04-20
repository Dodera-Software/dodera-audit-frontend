export interface SocialLink {
    label: string
    href: string
    icon: string
}

export function useLandingSocials(): SocialLink[] {
    return [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/pawbytech', icon: 'i-simple-icons-linkedin' },
        { label: 'X (Twitter)', href: 'https://x.com/pawbytech', icon: 'i-simple-icons-x' },
        { label: 'Instagram', href: 'https://www.instagram.com/pawbytech', icon: 'i-simple-icons-instagram' },
    ]
}
