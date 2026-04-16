<template>
  <div class="relative">
    <div class="scrollbar-dark max-h-[620px] overflow-y-auto bg-zinc-950">

      <!-- App navbar -->
      <div class="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-zinc-950/80 px-4">
        <!-- Left -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <AppLogo class="h-8 w-auto" />
            <span class="text-sm font-bold text-white">PawByTech</span>
          </div>
          <div class="h-5 w-px bg-zinc-800" />
          <div class="flex items-center gap-1">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400">
              <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
            </div>
            <span class="text-sm font-semibold text-white">Audit Report</span>
          </div>
        </div>
        <!-- Right -->
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/20">
            <UIcon name="i-lucide-share-2" class="h-3.5 w-3.5" />
            Share
          </button>
          <button class="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/20">
            <UIcon name="i-lucide-refresh-cw" class="h-3.5 w-3.5" />
            Re-scan
          </button>
          <div class="h-5 w-px bg-zinc-800" />
          <div class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400">
            <UIcon name="i-lucide-moon" class="h-4 w-4" />
          </div>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400">
            <UIcon name="i-lucide-bell" class="h-4 w-4" />
          </div>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400">
            <UIcon name="i-lucide-settings" class="h-4 w-4" />
          </div>
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            A
          </div>
        </div>
      </div>

      <!-- Meta bar -->
      <div class="flex flex-wrap items-center gap-2 border-b border-white/6 px-6 py-3">
        <div class="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5">
          <UIcon name="i-lucide-calendar" class="h-3.5 w-3.5 text-zinc-500" />
          <span class="text-xs text-zinc-400">Jan 15, 2026, 10:24 AM</span>
        </div>
        <div class="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5">
          <UIcon name="i-lucide-scan" class="h-3.5 w-3.5 text-zinc-500" />
          <span class="text-xs text-zinc-400">38.4s</span>
        </div>
        <div class="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5">
          <UIcon name="i-lucide-brain" class="h-3.5 w-3.5 text-zinc-500" />
          <span class="text-xs text-zinc-400">65.2s</span>
        </div>
        <div class="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5">
          <UIcon name="i-lucide-coins" class="h-3.5 w-3.5 text-zinc-500" />
          <span class="text-xs text-zinc-400">142,830 tokens</span>
        </div>
      </div>

      <!-- Overall score ring -->
      <div class="flex justify-center py-10">
        <div class="flex flex-col items-center">
          <div class="relative h-44 w-44">
            <svg class="h-full w-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="none" stroke="#27272a" stroke-width="12" />
              <circle
                cx="100" cy="100" r="88"
                fill="none" stroke="#10b981" stroke-width="12"
                stroke-linecap="round"
                stroke-dasharray="552.92"
                stroke-dashoffset="110.58"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-5xl font-bold text-emerald-400">80</span>
              <span class="text-sm text-zinc-500">/100</span>
            </div>
          </div>
          <p class="mt-4 text-sm font-medium text-zinc-400">Overall score</p>
        </div>
      </div>

      <!-- Category cards -->
      <div class="grid grid-cols-2 gap-3 px-6 pb-8 sm:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="cat in categories"
          :key="cat.label"
          class="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <UIcon :name="cat.icon" class="h-3.5 w-3.5 text-zinc-500" />
              <span class="text-[11px] font-semibold text-zinc-200">{{ cat.label }}</span>
            </div>
            <span class="text-lg font-bold" :class="cat.color">{{ cat.score }}</span>
          </div>
          <div class="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div class="h-full rounded-full" :class="cat.barColor" :style="{ width: cat.score + '%' }" />
          </div>
          <p class="mt-2 text-[10px] leading-tight text-zinc-600">{{ cat.description }}</p>
        </div>
      </div>

      <!-- Performance section -->
      <div class="px-6 pb-8">
        <h3 class="mb-1 text-base font-bold text-white">Performance</h3>
        <p class="mb-4 text-xs text-zinc-500">Scored as mobile ×0.6 + desktop ×0.4 (Google mobile-first indexing)</p>
        <div class="overflow-hidden rounded-xl border border-zinc-800">
          <table class="w-full">
            <thead>
              <tr class="border-b border-zinc-800 bg-zinc-900/60">
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-zinc-400">Metric</th>
                <th class="px-4 py-2.5 text-left">
                  <span class="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                    <UIcon name="i-lucide-monitor" class="h-3.5 w-3.5" />Desktop ×0.4
                  </span>
                </th>
                <th class="px-4 py-2.5 text-left">
                  <span class="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                    <UIcon name="i-lucide-smartphone" class="h-3.5 w-3.5" />Mobile ×0.6
                  </span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60">
              <tr v-for="row in perfRows" :key="row.metric">
                <td class="px-4 py-2.5 text-xs font-medium text-zinc-300">{{ row.metric }}</td>
                <td class="px-4 py-2.5">
                  <span class="flex items-center gap-1.5 text-xs text-zinc-300">
                    <span class="h-2 w-2 shrink-0 rounded-full" :class="row.desktopDot" />{{ row.desktop }}
                  </span>
                </td>
                <td class="px-4 py-2.5">
                  <span class="flex items-center gap-1.5 text-xs text-zinc-300">
                    <span class="h-2 w-2 shrink-0 rounded-full" :class="row.mobileDot" />{{ row.mobile }}
                    <UIcon v-if="row.mobileAlert" name="i-lucide-arrow-up" class="h-3 w-3 text-red-400" />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Brain assessment -->
      <div class="mx-6 mb-8 flex items-start gap-4 overflow-hidden rounded-xl border-l-4 border-violet-500 bg-zinc-900/60 p-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
          <UIcon name="i-lucide-brain" class="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-bold text-white">Your Brain's assessment</p>
            <span class="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">— Plateau</span>
          </div>
          <p class="mt-1 text-xs text-zinc-400">First audit baseline — run more audits to see your progress story.</p>
        </div>
      </div>

      <!-- Top issues -->
      <div class="px-6 pb-4">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
            <UIcon name="i-lucide-triangle-alert" class="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p class="text-sm font-bold text-white">Top issues</p>
            <p class="text-xs text-zinc-500">Highest impact issues to fix first</p>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="issue in topIssues"
            :key="issue.title"
            class="flex items-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black"
              :class="issue.badgeClass"
            >{{ issue.score }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white">{{ issue.title }}</p>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <span
                  v-for="tag in issue.tags"
                  :key="tag.label"
                  class="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                  :class="tag.class"
                >{{ tag.label }}</span>
              </div>
            </div>
            <UIcon name="i-lucide-chevron-right" class="h-4 w-4 shrink-0 text-zinc-600" />
          </div>
        </div>

        <div class="mt-4 flex justify-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-2.5 text-sm font-semibold text-emerald-400">
            <UIcon name="i-lucide-kanban" class="h-4 w-4" />
            View full board
          </div>
        </div>
      </div>

      <!-- Persona verdicts -->
      <div class="px-6 pb-8 pt-4">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
            <UIcon name="i-lucide-users" class="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p class="text-sm font-bold text-white">Persona verdicts</p>
            <p class="text-xs text-zinc-500">How different visitor types experience your page</p>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            v-for="persona in personaVerdicts"
            :key="persona.name"
            class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
          >
            <div class="mb-3 flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl" :class="persona.iconBg">
                  <UIcon :name="persona.icon" class="h-4 w-4" :class="persona.iconColor" />
                </div>
                <div>
                  <p class="text-sm font-bold text-white">{{ persona.name }}</p>
                  <p class="text-[11px] text-zinc-500">{{ persona.subtitle }}</p>
                </div>
              </div>
              <span
                class="flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                :class="persona.badgeClass"
              >
                <UIcon v-if="persona.verdict === 'Would convert'" name="i-lucide-check" class="h-3 w-3" />
                {{ persona.verdict }}
              </span>
            </div>
            <p class="mb-3 text-xs italic leading-relaxed text-zinc-400">"{{ persona.quote }}"</p>
            <button class="text-xs font-semibold text-emerald-500">Read full narrative</button>
            <div class="mt-3 rounded-xl bg-zinc-800/60 p-3">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Top concern</p>
              <p class="text-xs leading-relaxed text-zinc-300">{{ persona.concern }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
    <!-- Scroll hint fade -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />
  </div>
</template>

<script setup lang="ts">

interface Category {
  label: string
  icon: string
  score: number
  color: string
  barColor: string
  description: string
}

interface PerfRow {
  metric: string
  desktop: string
  mobile: string
  desktopDot: string
  mobileDot: string
  mobileAlert: boolean
}

interface Tag {
  label: string
  class: string
}

interface Issue {
  score: string
  title: string
  badgeClass: string
  tags: Tag[]
}

interface Persona {
  name: string
  subtitle: string
  icon: string
  iconBg: string
  iconColor: string
  verdict: string
  badgeClass: string
  quote: string
  concern: string
}

const categories: Category[] = [
  { label: 'Clarity', icon: 'i-lucide-eye', score: 82, color: 'text-emerald-400', barColor: 'bg-emerald-500', description: 'How clear and understandable your messaging is' },
  { label: 'Trust', icon: 'i-lucide-shield-check', score: 71, color: 'text-yellow-400', barColor: 'bg-yellow-500', description: 'How trustworthy your page appears to visitors' },
  { label: 'Conversion', icon: 'i-lucide-target', score: 78, color: 'text-yellow-400', barColor: 'bg-yellow-500', description: 'How effectively your page drives user actions' },
  { label: 'Performance', icon: 'i-lucide-zap', score: 93, color: 'text-emerald-400', barColor: 'bg-emerald-500', description: 'Page load speed and Core Web Vitals' },
  { label: 'Technical', icon: 'i-lucide-code-2', score: 85, color: 'text-emerald-400', barColor: 'bg-emerald-500', description: 'JavaScript errors, network failures, and code quality' },
  { label: 'SEO', icon: 'i-lucide-search', score: 63, color: 'text-yellow-400', barColor: 'bg-yellow-500', description: 'Meta tags, headings, Open Graph, and structured data' },
]

const perfRows: PerfRow[] = [
  { metric: 'LCP', desktop: '1,240 ms', mobile: '890 ms', desktopDot: 'bg-emerald-500', mobileDot: 'bg-emerald-500', mobileAlert: false },
  { metric: 'TTFB', desktop: '180 ms', mobile: '95 ms', desktopDot: 'bg-emerald-500', mobileDot: 'bg-emerald-500', mobileAlert: false },
  { metric: 'FCP', desktop: '1,240 ms', mobile: '890 ms', desktopDot: 'bg-emerald-500', mobileDot: 'bg-emerald-500', mobileAlert: false },
  { metric: 'CLS', desktop: '0.008', mobile: '0.187', desktopDot: 'bg-emerald-500', mobileDot: 'bg-red-500', mobileAlert: true },
  { metric: 'Total load', desktop: '1,080 ms', mobile: '620 ms', desktopDot: 'bg-zinc-500', mobileDot: 'bg-zinc-500', mobileAlert: false },
]

const topIssues: Issue[] = [
  {
    score: '6.7',
    title: 'Primary CTA anchor is lost once the hero section scrolls out of view',
    badgeClass: 'bg-amber-500 text-black',
    tags: [
      { label: 'Conversion', class: 'bg-teal-500/15 text-teal-400' },
      { label: 'High', class: 'bg-zinc-700/60 text-zinc-300' },
      { label: 'Quick fix', class: 'bg-zinc-700/60 text-zinc-300' },
    ],
  },
  {
    score: '5.9',
    title: 'Hero headline and features section use inconsistent benefit framing',
    badgeClass: 'bg-amber-500 text-black',
    tags: [
      { label: 'Clarity', class: 'bg-blue-500/15 text-blue-400' },
      { label: 'High', class: 'bg-zinc-700/60 text-zinc-300' },
      { label: 'Quick fix', class: 'bg-zinc-700/60 text-zinc-300' },
    ],
  },
  {
    score: '5.5',
    title: 'Metadata and structured data signals are too thin for a product landing page',
    badgeClass: 'bg-amber-500 text-black',
    tags: [
      { label: 'SEO', class: 'bg-emerald-500/15 text-emerald-400' },
      { label: 'High', class: 'bg-zinc-700/60 text-zinc-300' },
      { label: 'Quick fix', class: 'bg-zinc-700/60 text-zinc-300' },
    ],
  },
  {
    score: '5.2',
    title: 'Contrast ratios fall below WCAG AA in several secondary text elements',
    badgeClass: 'bg-blue-500 text-white',
    tags: [
      { label: 'Conversion', class: 'bg-teal-500/15 text-teal-400' },
      { label: 'Medium', class: 'bg-zinc-700/60 text-zinc-300' },
      { label: 'Quick fix', class: 'bg-zinc-700/60 text-zinc-300' },
    ],
  },
  {
    score: '4.4',
    title: 'Value proposition is not segmented by visitor type or use case',
    badgeClass: 'bg-blue-500 text-white',
    tags: [
      { label: 'Clarity', class: 'bg-blue-500/15 text-blue-400' },
      { label: 'Medium', class: 'bg-zinc-700/60 text-zinc-300' },
      { label: 'Quick fix', class: 'bg-zinc-700/60 text-zinc-300' },
    ],
  },
]

const personaVerdicts: Persona[] = [
  {
    name: 'The Skeptic',
    subtitle: 'Needs proof before trusting any claim',
    icon: 'i-lucide-search',
    iconBg: 'bg-amber-500/20 ring-1 ring-amber-500/30',
    iconColor: 'text-amber-400',
    verdict: 'Would convert',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    quote: 'I land on this page and the value proposition registers quickly. The headline communicates what the product does, and I can reach pricing without hunting. Social proof is present but thin — I need named customers and measurable outcomes before I commit to anything paid. I\'ll keep reading and look for the evidence trail...',
    concern: 'Trust signals are present but lack specificity — named customers and measurable outcomes would improve credibility significantly.',
  },
  {
    name: 'The Impulse Visitor',
    subtitle: 'Decides in seconds based on first impression',
    icon: 'i-lucide-zap',
    iconBg: 'bg-blue-500/20 ring-1 ring-blue-500/30',
    iconColor: 'text-blue-400',
    verdict: 'Would convert',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    quote: 'Three seconds in, I understand what this is and who it\'s for. The hero is clean, the primary CTA is visible, and the free trial option removes my main hesitation. I don\'t read pages — I scan them. This one passes the scan. A slightly more prominent button would have had me clicking before I finished reading the headline...',
    concern: 'The above-the-fold experience is strong, but the secondary CTA in the pricing section sends mixed signals about the primary conversion goal.',
  },
  {
    name: 'The Comparison Shopper',
    subtitle: 'Evaluates multiple options before committing',
    icon: 'i-lucide-scale',
    iconBg: 'bg-violet-500/20 ring-1 ring-violet-500/30',
    iconColor: 'text-violet-400',
    verdict: 'Uncertain',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    quote: 'I\'m running this against three other tools in this category. Feature coverage looks competitive, but the pricing page doesn\'t give me enough granularity to build a proper side-by-side. I need to know exactly what I give up on the lower tier. Until I can map features cleanly, this stays in the maybe column...',
    concern: 'Plan differentiation is unclear — a direct feature-by-feature matrix would significantly support the comparison decision.',
  },
]
</script>

<style scoped>
.scrollbar-dark::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-dark::-webkit-scrollbar-track {
  background: #09090b;
}
.scrollbar-dark::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 9999px;
}
.scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}
</style>
