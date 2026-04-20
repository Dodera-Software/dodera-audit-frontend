export function useLandingSeo(): void {
    useHead({
        script: [
            {
                type: 'application/ld+json',
                children: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: 'PawByTech',
                    url: 'https://pawbytech.com',
                    logo: 'https://pawbytech.com/logo.png',
                    description: 'AI-powered website audit platform with 7+ AI personas for analyzing clarity, trust, conversion potential and UX',
                    sameAs: [
                        'https://twitter.com/pawbytech',
                        'https://linkedin.com/company/pawbytech',
                    ],
                    contactPoint: {
                        '@type': 'ContactPoint',
                        contactType: 'Customer Support',
                        url: 'https://pawbytech.com',
                    },
                }),
            },
            {
                type: 'application/ld+json',
                children: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'PawByTech',
                    description: 'AI website audit tool that analyzes clarity, trust, conversion potential and UX with 7+ AI personas',
                    url: 'https://pawbytech.com',
                    applicationCategory: 'BusinessApplication',
                    offers: [
                        {
                            '@type': 'Offer',
                            name: 'Free',
                            price: '0',
                            priceCurrency: 'EUR',
                            description: 'Free AI website audit — no credit card required',
                        },
                        {
                            '@type': 'Offer',
                            name: 'Pro',
                            price: '20',
                            priceCurrency: 'EUR',
                            description: 'Pro plan for individuals and small teams — €20/month',
                        },
                        {
                            '@type': 'Offer',
                            name: 'Max',
                            price: '100',
                            priceCurrency: 'EUR',
                            description: 'Max plan for agencies and power users — €100/month',
                        },
                    ],
                    featureList: [
                        '7+ AI Persona Agents',
                        'Conversion Scoring',
                        'Kanban Issue Board',
                        'Project Brain AI Learning',
                        '5-Second First Impression Test',
                        'Regression Detection',
                        'Results in under 3 minutes',
                    ],
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: '4.9',
                        ratingCount: '1200',
                    },
                }),
            },
            {
                type: 'application/ld+json',
                children: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: [
                        {
                            '@type': 'Question',
                            name: 'What counts as an audit?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'One full page scan and AI analysis counts as one audit. Partial re-scans also count.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'Can I cancel anytime?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Yes. Cancel from the billing portal and your plan remains active until the end of the billing period.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'What are extra members?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Each extra member gets their own login to collaborate on projects and view audit reports. Team management is coming soon.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'What is the custom OpenAI API key?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Max plan users can connect their own OpenAI API key to run unlimited audits at their own cost. Add your key in account settings.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'Is there a tutorial for new users?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Yes! Every new user gets a free interactive tutorial inside the app that walks you through your first audit step by step — no prior experience needed.',
                            },
                        },
                    ],
                }),
            },
        ],
    })
}
