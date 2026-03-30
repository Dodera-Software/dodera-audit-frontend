<template>
  <div class="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">

    <!-- Dynamic background glow — shifts color per active agent -->
    <div
      class="pointer-events-none absolute inset-0 transition-all duration-1000"
      :style="{ background: `radial-gradient(ellipse 80% 60% at 50% 35%, ${glowColor} 0%, transparent 68%)` }"
    />

    <!-- ====== FAILED ====== -->
    <div v-if="scan.status === 'failed'" class="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
      <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 ring-1 ring-red-500/20">
        <UIcon name="i-lucide-alert-circle" class="h-12 w-12 text-red-500" />
      </div>
      <div>
        <h2 class="text-4xl font-bold text-(--ui-text-highlighted)">{{ t('Scan failed') }}</h2>
        <p class="mt-3 max-w-sm text-lg text-(--ui-text-muted)">
          {{ scan.error || t('Something went wrong. Please try again.') }}
        </p>
      </div>
      <UButton size="lg" icon="i-lucide-refresh-cw" @click="$emit('retry')">
        {{ t('Retry scan') }}
      </UButton>
    </div>

    <!-- ====== ACTIVE SCAN ====== -->
    <template v-else>
      <div class="relative z-10 flex w-full flex-col items-center justify-center px-6">

        <!-- PHASE: Preparing (validating / scanning / extracting) -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'preparing'" key="preparing" class="flex flex-col items-center text-center">
            <Vue3Lottie
              animation-link="/animations/searching.json"
              :height="200"
              :width="200"
              :loop="true"
              :auto-play="true"
            />
            <p class="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
              {{ t('Audit in progress') }}
            </p>
            <Transition name="step-text" mode="out-in">
              <h1 :key="scan.currentStep" class="mt-3 text-5xl font-bold tracking-tight text-(--ui-text-highlighted)">
                {{ preparingHeadline }}
              </h1>
            </Transition>
            <p class="mt-4 max-w-md text-lg text-(--ui-text-muted)">{{ preparingSubtitle }}</p>

            <!-- Step pills -->
            <div class="mt-14 flex flex-wrap items-center justify-center gap-3">
              <div
                v-for="step in preparingSteps"
                :key="step"
                class="flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-500"
                :class="stepPillClass(step)"
              >
                <UIcon v-if="stepStatus(step) === 'done'" name="i-lucide-check-circle-2" class="h-4 w-4" />
                <UIcon v-else-if="stepStatus(step) === 'active'" name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
                <div v-else class="h-2 w-2 rounded-full bg-current opacity-30" />
                {{ stepPillLabel(step) }}
              </div>
            </div>
          </div>
        </Transition>

        <!-- PHASE: Analyzing (Agent Spotlight) -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'analyzing'" key="analyzing" class="flex w-full max-w-2xl flex-col items-center">

            <!-- Completed agent chips -->
            <div class="mb-8 flex min-h-9 flex-wrap justify-center gap-2">
              <TransitionGroup name="chip">
                <span
                  v-for="agent in completedAgents"
                  :key="agent.key"
                  class="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-500"
                >
                  <UIcon name="i-lucide-check" class="h-3 w-3" />
                  {{ agent.shortName }}
                </span>
              </TransitionGroup>
            </div>

            <!-- Spotlight card -->
            <Transition name="agent" mode="out-in">
              <div
                v-if="currentAgent"
                :key="scan.agentsCompleted"
                class="w-full rounded-3xl border p-10 text-center"
                :class="currentAgent.cardClass"
              >
                <!-- Type badge -->
                <span
                  class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
                  :class="currentAgent.badgeClass"
                >
                  <UIcon name="i-lucide-sparkles" class="h-3 w-3" />
                  {{ currentAgent.type === 'persona' ? t('AI Persona') : t('AI Specialist') }}
                </span>

                <!-- Icon -->
                <div
                  class="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-3xl ring-1 ring-inset"
                  :class="currentAgent.iconBgClass"
                >
                  <UIcon :name="currentAgent.icon" class="h-14 w-14" :class="currentAgent.iconClass" />
                </div>

                <!-- Name -->
                <h2 class="mt-7 text-[2.75rem] font-bold leading-tight tracking-tight text-(--ui-text-highlighted)">
                  {{ currentAgent.name }}
                </h2>

                <!-- Tagline -->
                <p class="mx-auto mt-4 max-w-sm text-lg text-(--ui-text-muted)">
                  {{ currentAgent.tagline }}
                </p>

                <!-- Pulsing indicator -->
                <div class="mt-8 flex items-center justify-center gap-2 text-sm" :class="currentAgent.iconClass">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" :class="currentAgent.pingClass" />
                    <span class="relative inline-flex h-2.5 w-2.5 rounded-full" :class="currentAgent.dotClass" />
                  </span>
                  {{ t('Analyzing now...') }}
                </div>
              </div>
            </Transition>

            <!-- Progress bar -->
            <div class="mt-8 w-full">
              <div class="mb-2.5 flex items-center justify-between text-sm text-(--ui-text-dimmed)">
                <span class="font-medium">
                  {{ scan.agentsCompleted }} {{ t('of') }} {{ scan.agentsTotal }} {{ t('agents complete') }}
                </span>
                <span>{{ agentProgressPct }}%</span>
              </div>
              <UProgress :value="agentProgressPct" size="sm" />
            </div>
          </div>
        </Transition>

        <!-- PHASE: Synthesizing -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'synthesizing'" key="synthesizing" class="flex flex-col items-center text-center">
            <Vue3Lottie
              animation-link="/animations/animation-bot.json"
              :height="200"
              :width="200"
              :loop="true"
              :auto-play="true"
            />
            <p class="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
              {{ t('Almost there') }}
            </p>
            <h1 class="mt-3 text-5xl font-bold tracking-tight text-(--ui-text-highlighted)">
              {{ t('Synthesizing insights') }}
            </h1>
            <p class="mt-4 text-lg text-(--ui-text-muted)">
              {{ t('Combining findings from') }} {{ scan.agentsTotal }} {{ t('AI agents') }}
            </p>
            <div class="mt-10 flex flex-wrap justify-center gap-2">
              <span
                v-for="agent in ALL_AGENTS"
                :key="agent.key"
                class="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-500"
              >
                <UIcon name="i-lucide-check" class="h-3 w-3" />
                {{ agent.shortName }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- PHASE: Assembling -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'assembling'" key="assembling" class="flex flex-col items-center text-center">
            <Vue3Lottie
              animation-link="/animations/animation-bot.json"
              :height="200"
              :width="200"
              :loop="true"
              :auto-play="true"
            />
            <p class="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
              {{ t('Final step') }}
            </p>
            <h1 class="mt-3 text-5xl font-bold tracking-tight text-(--ui-text-highlighted)">
              {{ t('Building your report') }}
            </h1>
            <p class="mt-4 text-lg text-(--ui-text-muted)">
              {{ t('Your scored audit report is almost ready') }}
            </p>
          </div>
        </Transition>
      </div>

      <!-- Step progress dots — always visible at bottom -->
      <div class="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2">
        <div
          v-for="step in SCAN_STEPS"
          :key="step.key"
          class="rounded-full transition-all duration-500"
          :class="stepDotClass(step.key)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'
import { SCAN_STEPS } from '~/constants/scan'
import type { ScanStepStatus } from '~/constants/scan'

const ALL_AGENTS = [
  {
    key: 'visual',
    shortName: 'Visual',
    name: 'Visual Analyst',
    icon: 'i-lucide-eye',
    tagline: 'Evaluating visual hierarchy, imagery quality, and first impressions',
    type: 'specialist',
    cardClass: 'border-purple-500/30 bg-purple-500/5 shadow-[0_0_100px_rgba(168,85,247,0.12)]',
    badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    iconBgClass: 'bg-purple-500/15 ring-purple-500/20',
    iconClass: 'text-purple-400',
    pingClass: 'bg-purple-400',
    dotClass: 'bg-purple-400',
    glow: 'rgba(168,85,247,0.22)',
  },
  {
    key: 'trust',
    shortName: 'Trust',
    name: 'Trust Auditor',
    icon: 'i-lucide-shield-check',
    tagline: 'Scanning for trust signals, social proof, and credibility markers',
    type: 'specialist',
    cardClass: 'border-blue-500/30 bg-blue-500/5 shadow-[0_0_100px_rgba(59,130,246,0.12)]',
    badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    iconBgClass: 'bg-blue-500/15 ring-blue-500/20',
    iconClass: 'text-blue-400',
    pingClass: 'bg-blue-400',
    dotClass: 'bg-blue-400',
    glow: 'rgba(59,130,246,0.22)',
  },
  {
    key: 'conversion',
    shortName: 'Conversion',
    name: 'Conversion Critic',
    icon: 'i-lucide-mouse-pointer-click',
    tagline: 'Identifying friction points and barriers blocking user conversions',
    type: 'specialist',
    cardClass: 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_100px_rgba(249,115,22,0.12)]',
    badgeClass: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    iconBgClass: 'bg-orange-500/15 ring-orange-500/20',
    iconClass: 'text-orange-400',
    pingClass: 'bg-orange-400',
    dotClass: 'bg-orange-400',
    glow: 'rgba(249,115,22,0.22)',
  },
  {
    key: 'code',
    shortName: 'Code',
    name: 'Code Inspector',
    icon: 'i-lucide-code-2',
    tagline: 'Detecting JavaScript errors, network failures, and technical issues',
    type: 'specialist',
    cardClass: 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_100px_rgba(16,185,129,0.12)]',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    iconBgClass: 'bg-emerald-500/15 ring-emerald-500/20',
    iconClass: 'text-emerald-400',
    pingClass: 'bg-emerald-400',
    dotClass: 'bg-emerald-400',
    glow: 'rgba(16,185,129,0.22)',
  },
  {
    key: 'content',
    shortName: 'Content',
    name: 'Content Reviewer',
    icon: 'i-lucide-file-text',
    tagline: 'Analyzing messaging clarity, headline strength, and copy effectiveness',
    type: 'specialist',
    cardClass: 'border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_100px_rgba(234,179,8,0.12)]',
    badgeClass: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    iconBgClass: 'bg-yellow-500/15 ring-yellow-500/20',
    iconClass: 'text-yellow-400',
    pingClass: 'bg-yellow-400',
    dotClass: 'bg-yellow-400',
    glow: 'rgba(234,179,8,0.22)',
  },
  {
    key: 'accessibility',
    shortName: 'A11y',
    name: 'Accessibility Auditor',
    icon: 'i-lucide-accessibility',
    tagline: 'Checking contrast ratios, touch targets, and inclusive design standards',
    type: 'specialist',
    cardClass: 'border-pink-500/30 bg-pink-500/5 shadow-[0_0_100px_rgba(236,72,153,0.12)]',
    badgeClass: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
    iconBgClass: 'bg-pink-500/15 ring-pink-500/20',
    iconClass: 'text-pink-400',
    pingClass: 'bg-pink-400',
    dotClass: 'bg-pink-400',
    glow: 'rgba(236,72,153,0.22)',
  },
  {
    key: 'seo',
    shortName: 'SEO',
    name: 'SEO Auditor',
    icon: 'i-lucide-search',
    tagline: 'Reviewing meta tags, Open Graph, structured data, and heading hierarchy',
    type: 'specialist',
    cardClass: 'border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_100px_rgba(6,182,212,0.12)]',
    badgeClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    iconBgClass: 'bg-cyan-500/15 ring-cyan-500/20',
    iconClass: 'text-cyan-400',
    pingClass: 'bg-cyan-400',
    dotClass: 'bg-cyan-400',
    glow: 'rgba(6,182,212,0.22)',
  },
  {
    key: 'skeptic',
    shortName: 'Skeptic',
    name: 'The Skeptic',
    icon: 'i-lucide-search-x',
    tagline: 'Challenging every claim with an unforgiving, critical eye',
    type: 'persona',
    cardClass: 'border-red-500/30 bg-red-500/5 shadow-[0_0_100px_rgba(239,68,68,0.12)]',
    badgeClass: 'border-red-500/30 bg-red-500/10 text-red-400',
    iconBgClass: 'bg-red-500/15 ring-red-500/20',
    iconClass: 'text-red-400',
    pingClass: 'bg-red-400',
    dotClass: 'bg-red-400',
    glow: 'rgba(239,68,68,0.22)',
  },
  {
    key: 'impulse',
    shortName: 'Impulse',
    name: 'Impulse Visitor',
    icon: 'i-lucide-zap',
    tagline: 'Deciding in 3 seconds whether to convert or bounce',
    type: 'persona',
    cardClass: 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_100px_rgba(245,158,11,0.12)]',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    iconBgClass: 'bg-amber-500/15 ring-amber-500/20',
    iconClass: 'text-amber-400',
    pingClass: 'bg-amber-400',
    dotClass: 'bg-amber-400',
    glow: 'rgba(245,158,11,0.22)',
  },
  {
    key: 'comparison',
    shortName: 'Shopper',
    name: 'Comparison Shopper',
    icon: 'i-lucide-scale',
    tagline: 'Evaluating how your page stacks up against the competition',
    type: 'persona',
    cardClass: 'border-teal-500/30 bg-teal-500/5 shadow-[0_0_100px_rgba(20,184,166,0.12)]',
    badgeClass: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
    iconBgClass: 'bg-teal-500/15 ring-teal-500/20',
    iconClass: 'text-teal-400',
    pingClass: 'bg-teal-400',
    dotClass: 'bg-teal-400',
    glow: 'rgba(20,184,166,0.22)',
  },
]

const props = defineProps<{
  scan: {
    status: string
    currentStep: string
    stepStatuses: Record<string, ScanStepStatus>
    error: string | null
    agentsCompleted: number
    agentsTotal: number
  }
}>()

defineEmits<{ retry: [] }>()

const { t } = useI18n()

const preparingSteps = ['validating', 'scanning', 'extracting']

const phase = computed(() => {
  const step = props.scan.currentStep
  if (preparingSteps.includes(step)) return 'preparing'
  if (step === 'analyzing') return 'analyzing'
  if (step === 'synthesizing') return 'synthesizing'
  if (step === 'assembling') return 'assembling'
  return 'preparing'
})

const preparingHeadline = computed(() => {
  const map: Record<string, () => string> = {
    validating: () => t('Validating your URL'),
    scanning: () => t('Loading your page'),
    extracting: () => t('Extracting content'),
  }
  return map[props.scan.currentStep]?.() ?? t('Preparing...')
})

const preparingSubtitle = computed(() => {
  const map: Record<string, () => string> = {
    validating: () => t('Checking that your page is reachable and loads correctly'),
    scanning: () => t('Opening your page in a real browser to capture what visitors see'),
    extracting: () => t('Pulling headings, CTAs, trust signals, and page structure'),
  }
  return map[props.scan.currentStep]?.() ?? ''
})

const currentAgent = computed(() => ALL_AGENTS[props.scan.agentsCompleted] ?? null)

const completedAgents = computed(() => ALL_AGENTS.slice(0, props.scan.agentsCompleted))

const agentProgressPct = computed(() => {
  if (props.scan.agentsTotal === 0) return 0
  return Math.round((props.scan.agentsCompleted / props.scan.agentsTotal) * 100)
})

const glowColor = computed(() => {
  if (phase.value === 'analyzing' && currentAgent.value) return currentAgent.value.glow
  if (phase.value === 'synthesizing' || phase.value === 'assembling') return 'rgba(99,102,241,0.2)'
  return 'rgba(99,102,241,0.15)'
})

function stepStatus(key: string): ScanStepStatus {
  return props.scan.stepStatuses[key] ?? 'pending'
}

function stepPillLabel(key: string): string {
  const map: Record<string, () => string> = {
    validating: () => t('Validate URL'),
    scanning: () => t('Load page'),
    extracting: () => t('Extract content'),
  }
  return map[key]?.() ?? key
}

function stepPillClass(key: string): string {
  const status = stepStatus(key)
  if (status === 'done') return 'border-green-500/30 bg-green-500/10 text-green-500'
  if (status === 'active') return 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
  return 'border-(--ui-border) text-(--ui-text-dimmed)'
}

function stepDotClass(key: string): string {
  const status = stepStatus(key)
  if (status === 'done') return 'h-1.5 w-5 bg-green-500'
  if (status === 'active') return 'h-1.5 w-5 bg-blue-500'
  if (status === 'failed') return 'h-1.5 w-1.5 bg-red-500'
  return 'h-1.5 w-1.5 bg-(--ui-border)'
}


</script>

<style scoped>
/* Phase transitions */
.phase-enter-active,
.phase-leave-active {
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.phase-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.97);
}
.phase-leave-to {
  opacity: 0;
  transform: translateY(-28px) scale(0.97);
}

/* Agent card transitions — slides left to right (sense of progress) */
.agent-enter-active,
.agent-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.agent-enter-from {
  opacity: 0;
  transform: translateX(48px) scale(0.96);
}
.agent-leave-to {
  opacity: 0;
  transform: translateX(-48px) scale(0.96);
}

/* Step headline transitions */
.step-text-enter-active,
.step-text-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.step-text-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.step-text-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Completed agent chip pop-in */
.chip-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chip-enter-from {
  opacity: 0;
  transform: scale(0.4);
}
.chip-move {
  transition: all 0.3s ease;
}
</style>
