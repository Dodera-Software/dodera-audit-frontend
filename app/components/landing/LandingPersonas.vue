<template>
  <div>
    <!-- ── Personas showcase ── -->
    <section class="px-6 py-28">
      <div class="mx-auto max-w-7xl">
        <p class="mb-3 text-center text-sm font-bold uppercase tracking-widest text-emerald-500">{{ t('AI analysts') }}</p>
        <h2 class="mb-4 text-center text-4xl font-black tracking-tight text-white md:text-5xl">
          {{ t('Meet your review committee.') }}
        </h2>
        <p class="mx-auto mb-16 max-w-2xl text-center text-lg text-zinc-400">
          {{ t('Seven distinct AI personalities audit your page simultaneously — each with different goals, biases, and friction points.') }}
        </p>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="persona in personas"
            :key="persona.name"
            class="group relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1"
            :class="persona.cardClass"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              :class="persona.hoverGlow"
            />
            <div class="relative z-10">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="persona.iconBg">
                <UIcon :name="persona.icon" class="h-6 w-6" :class="persona.iconColor" />
              </div>
              <h3 class="mt-4 text-base font-black text-white">{{ persona.name }}</h3>
              <p class="mt-1 text-xs font-semibold" :class="persona.iconColor">{{ persona.tagline }}</p>
              <p class="mt-3 text-sm leading-relaxed text-zinc-400">{{ persona.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Stats ── -->
    <section class="px-6 py-20">
      <div class="mx-auto max-w-5xl">
        <div class="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-3">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex flex-col items-center justify-center bg-black/25 px-10 py-16 text-center backdrop-blur-sm"
          >
            <span class="text-5xl font-black text-white md:text-6xl">{{ stat.value }}</span>
            <span class="mt-2 text-sm font-medium text-zinc-500">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Persona {
  name: string
  tagline: string
  icon: string
  description: string
  cardClass: string
  iconBg: string
  iconColor: string
  hoverGlow: string
}

const personas = computed<Persona[]>(() => [
  {
    name: t('The Skeptic'),
    tagline: t('Needs proof before trusting'),
    icon: 'i-lucide-search',
    description: t('Questions every claim. Looks for testimonials, certifications, and hard data before considering a purchase.'),
    cardClass: 'border-amber-500/25 bg-black/20 backdrop-blur-sm',
    iconBg: 'bg-amber-500/20 ring-1 ring-amber-500/35',
    iconColor: 'text-amber-400',
    hoverGlow: 'from-amber-500/10',
  },
  {
    name: t('Impulse Visitor'),
    tagline: t('Decides in 5 seconds'),
    icon: 'i-lucide-zap',
    description: t("Emotion-driven. If your hero doesn't hook them immediately, they're gone. Responds to urgency and bold visuals."),
    cardClass: 'border-blue-500/25 bg-black/20 backdrop-blur-sm',
    iconBg: 'bg-blue-500/20 ring-1 ring-blue-500/35',
    iconColor: 'text-blue-400',
    hoverGlow: 'from-blue-500/10',
  },
  {
    name: t('Comparison Shopper'),
    tagline: t('Weighs every alternative'),
    icon: 'i-lucide-scale',
    description: t('Has three tabs open. Scrutinizes pricing, features, and social proof rigorously against competitors.'),
    cardClass: 'border-purple-500/25 bg-black/20 backdrop-blur-sm',
    iconBg: 'bg-purple-500/20 ring-1 ring-purple-500/35',
    iconColor: 'text-purple-400',
    hoverGlow: 'from-purple-500/10',
  },
  {
    name: t('Value Seeker'),
    tagline: t('ROI before anything else'),
    icon: 'i-lucide-badge-percent',
    description: t('Calculates return on every dollar. Pricing pages, case studies, and ROI calculators are their first stop.'),
    cardClass: 'border-emerald-500/25 bg-black/20 backdrop-blur-sm',
    iconBg: 'bg-emerald-500/20 ring-1 ring-emerald-500/35',
    iconColor: 'text-emerald-400',
    hoverGlow: 'from-emerald-500/10',
  },
  {
    name: t('Mobile User'),
    tagline: t('Browsing on the go'),
    icon: 'i-lucide-smartphone',
    description: t('Touch targets, load time, and above-the-fold content are everything. Desktop-first designs fail this persona.'),
    cardClass: 'border-cyan-500/25 bg-black/20 backdrop-blur-sm',
    iconBg: 'bg-cyan-500/20 ring-1 ring-cyan-500/35',
    iconColor: 'text-cyan-400',
    hoverGlow: 'from-cyan-500/10',
  },
  {
    name: t('First-Time Visitor'),
    tagline: t('No brand familiarity'),
    icon: 'i-lucide-user',
    description: t("Arrives cold from an ad or search. Evaluates whether you're a real, trustworthy company from scratch."),
    cardClass: 'border-rose-500/25 bg-black/20 backdrop-blur-sm',
    iconBg: 'bg-rose-500/20 ring-1 ring-rose-500/35',
    iconColor: 'text-rose-400',
    hoverGlow: 'from-rose-500/10',
  },
  {
    name: t('Power User'),
    tagline: t('Researches in depth'),
    icon: 'i-lucide-glasses',
    description: t('Reads every word, checks your About page, looks for documentation, and wants to understand everything deeply.'),
    cardClass: 'border-violet-500/25 bg-black/20 backdrop-blur-sm',
    iconBg: 'bg-violet-500/20 ring-1 ring-violet-500/35',
    iconColor: 'text-violet-400',
    hoverGlow: 'from-violet-500/10',
  },
])

const stats = computed(() => [
  { value: '7', label: t('AI Persona Agents') },
  { value: '5+', label: t('Score Dimensions') },
  { value: '< 3 min', label: t('Time to Full Report') },
])
</script>
