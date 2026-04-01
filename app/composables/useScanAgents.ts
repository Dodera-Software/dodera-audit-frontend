export interface ScanAgent {
  key: string
  backendName: string
  shortName: string
  name: string
  icon: string
  tagline: string
  type: 'specialist' | 'persona'
  cardClass: string
  badgeClass: string
  iconBgClass: string
  iconClass: string
  pingClass: string
  dotClass: string
  glow: string
}

interface AgentStyle {
  cardClass: string
  badgeClass: string
  iconBgClass: string
  iconClass: string
  pingClass: string
  dotClass: string
  glow: string
}

const AGENT_STYLES: Record<string, AgentStyle> = {
  visual: {
    cardClass: 'border-purple-500/30 bg-purple-500/5 shadow-[0_0_100px_rgba(168,85,247,0.12)]',
    badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    iconBgClass: 'bg-purple-500/15 ring-purple-500/20',
    iconClass: 'text-purple-400',
    pingClass: 'bg-purple-400',
    dotClass: 'bg-purple-400',
    glow: 'rgba(168,85,247,0.22)',
  },
  trust: {
    cardClass: 'border-blue-500/30 bg-blue-500/5 shadow-[0_0_100px_rgba(59,130,246,0.12)]',
    badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    iconBgClass: 'bg-blue-500/15 ring-blue-500/20',
    iconClass: 'text-blue-400',
    pingClass: 'bg-blue-400',
    dotClass: 'bg-blue-400',
    glow: 'rgba(59,130,246,0.22)',
  },
  conversion: {
    cardClass: 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_100px_rgba(249,115,22,0.12)]',
    badgeClass: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    iconBgClass: 'bg-orange-500/15 ring-orange-500/20',
    iconClass: 'text-orange-400',
    pingClass: 'bg-orange-400',
    dotClass: 'bg-orange-400',
    glow: 'rgba(249,115,22,0.22)',
  },
  code: {
    cardClass: 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_100px_rgba(16,185,129,0.12)]',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    iconBgClass: 'bg-emerald-500/15 ring-emerald-500/20',
    iconClass: 'text-emerald-400',
    pingClass: 'bg-emerald-400',
    dotClass: 'bg-emerald-400',
    glow: 'rgba(16,185,129,0.22)',
  },
  content: {
    cardClass: 'border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_100px_rgba(234,179,8,0.12)]',
    badgeClass: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    iconBgClass: 'bg-yellow-500/15 ring-yellow-500/20',
    iconClass: 'text-yellow-400',
    pingClass: 'bg-yellow-400',
    dotClass: 'bg-yellow-400',
    glow: 'rgba(234,179,8,0.22)',
  },
  accessibility: {
    cardClass: 'border-pink-500/30 bg-pink-500/5 shadow-[0_0_100px_rgba(236,72,153,0.12)]',
    badgeClass: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
    iconBgClass: 'bg-pink-500/15 ring-pink-500/20',
    iconClass: 'text-pink-400',
    pingClass: 'bg-pink-400',
    dotClass: 'bg-pink-400',
    glow: 'rgba(236,72,153,0.22)',
  },
  seo: {
    cardClass: 'border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_100px_rgba(6,182,212,0.12)]',
    badgeClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    iconBgClass: 'bg-cyan-500/15 ring-cyan-500/20',
    iconClass: 'text-cyan-400',
    pingClass: 'bg-cyan-400',
    dotClass: 'bg-cyan-400',
    glow: 'rgba(6,182,212,0.22)',
  },
  skeptic: {
    cardClass: 'border-red-500/30 bg-red-500/5 shadow-[0_0_100px_rgba(239,68,68,0.12)]',
    badgeClass: 'border-red-500/30 bg-red-500/10 text-red-400',
    iconBgClass: 'bg-red-500/15 ring-red-500/20',
    iconClass: 'text-red-400',
    pingClass: 'bg-red-400',
    dotClass: 'bg-red-400',
    glow: 'rgba(239,68,68,0.22)',
  },
  impulse: {
    cardClass: 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_100px_rgba(245,158,11,0.12)]',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    iconBgClass: 'bg-amber-500/15 ring-amber-500/20',
    iconClass: 'text-amber-400',
    pingClass: 'bg-amber-400',
    dotClass: 'bg-amber-400',
    glow: 'rgba(245,158,11,0.22)',
  },
  comparison: {
    cardClass: 'border-teal-500/30 bg-teal-500/5 shadow-[0_0_100px_rgba(20,184,166,0.12)]',
    badgeClass: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
    iconBgClass: 'bg-teal-500/15 ring-teal-500/20',
    iconClass: 'text-teal-400',
    pingClass: 'bg-teal-400',
    dotClass: 'bg-teal-400',
    glow: 'rgba(20,184,166,0.22)',
  },
}

export function useScanAgents() {
  const { t } = useI18n()

  const allAgents = computed<ScanAgent[]>(() => [
    {
      key: 'visual',
      backendName: 'visual_analysis',
      shortName: t('Visual'),
      name: t('Visual Analyst'),
      icon: 'i-lucide-eye',
      tagline: t('Evaluating visual hierarchy, imagery quality, and first impressions'),
      type: 'specialist',
      ...AGENT_STYLES.visual,
    },
    {
      key: 'trust',
      backendName: 'trust_signal',
      shortName: t('Trust'),
      name: t('Trust Auditor'),
      icon: 'i-lucide-shield-check',
      tagline: t('Scanning for trust signals, social proof, and credibility markers'),
      type: 'specialist',
      ...AGENT_STYLES.trust,
    },
    {
      key: 'conversion',
      backendName: 'conversion_friction',
      shortName: t('Conversion'),
      name: t('Conversion Critic'),
      icon: 'i-lucide-mouse-pointer-click',
      tagline: t('Identifying friction points and barriers blocking user conversions'),
      type: 'specialist',
      ...AGENT_STYLES.conversion,
    },
    {
      key: 'code',
      backendName: 'code_analysis',
      shortName: t('Code'),
      name: t('Code Inspector'),
      icon: 'i-lucide-code-2',
      tagline: t('Detecting JavaScript errors, network failures, and technical issues'),
      type: 'specialist',
      ...AGENT_STYLES.code,
    },
    {
      key: 'content',
      backendName: 'content_quality',
      shortName: t('Content'),
      name: t('Content Reviewer'),
      icon: 'i-lucide-file-text',
      tagline: t('Analyzing messaging clarity, headline strength, and copy effectiveness'),
      type: 'specialist',
      ...AGENT_STYLES.content,
    },
    {
      key: 'accessibility',
      backendName: 'accessibility',
      shortName: t('Accessibility'),
      name: t('Accessibility Auditor'),
      icon: 'i-lucide-accessibility',
      tagline: t('Checking contrast ratios, touch targets, and inclusive design standards'),
      type: 'specialist',
      ...AGENT_STYLES.accessibility,
    },
    {
      key: 'seo',
      backendName: 'seo_analysis',
      shortName: t('SEO'),
      name: t('SEO Auditor'),
      icon: 'i-lucide-search',
      tagline: t('Reviewing meta tags, Open Graph, structured data, and heading hierarchy'),
      type: 'specialist',
      ...AGENT_STYLES.seo,
    },
    {
      key: 'skeptic',
      backendName: 'persona_skeptic',
      shortName: t('Skeptic'),
      name: t('The Skeptic'),
      icon: 'i-lucide-search-x',
      tagline: t('Challenging every claim with an unforgiving, critical eye'),
      type: 'persona',
      ...AGENT_STYLES.skeptic,
    },
    {
      key: 'impulse',
      backendName: 'persona_impulse',
      shortName: t('Impulse'),
      name: t('Impulse Visitor'),
      icon: 'i-lucide-zap',
      tagline: t('Deciding in 3 seconds whether to convert or bounce'),
      type: 'persona',
      ...AGENT_STYLES.impulse,
    },
    {
      key: 'comparison',
      backendName: 'persona_comparison',
      shortName: t('Shopper'),
      name: t('Comparison Shopper'),
      icon: 'i-lucide-scale',
      tagline: t('Evaluating how your page stacks up against the competition'),
      type: 'persona',
      ...AGENT_STYLES.comparison,
    },
  ])

  return { allAgents }
}
