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
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'EUR',
                        description: 'Free AI website audit with no credit card required',
                    },
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
                            name: 'What is PawByTech?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'PawByTech is an AI-powered website audit platform that analyzes your website through the lens of 7+ different AI personas (like The Skeptic, Impulse Visitor, and Comparison Shopper) to evaluate clarity, trust, conversion potential, and overall UX.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'How does the AI audit work?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Simply paste your URL. Our AI personas browse your page like real visitors would and provide scores across 6 dimensions: clarity, trust, conversion intent, mobile experience, visual hierarchy, and technical performance. Results are delivered in under 3 minutes.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'Do I need to change my code?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'No. PawByTech requires no code changes, no integration, and no installation. Simply paste your URL and get your audit results.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'Is there a free plan?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Yes. PawByTech offers a free plan with no credit card required. You can run your first audit immediately and explore all core features.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'What is the Kanban Issue Board?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'The Kanban Issue Board is a visual task management system where each audit issue is a card. You can drag and prioritize issues, assign status, and track fixes from detection through verification.',
                            },
                        },
                        {
                            '@type': 'Question',
                            name: 'What is Project Brain?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Project Brain is an AI-powered learning system that learns from all your audits over time, detects patterns, identifies regressions, and narrates your improvement story.',
                            },
                        },
                    ],
                }),
            },
        ],
    })
}
