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
                v-for="step in PREPARING_STEPS"
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

        <!-- PHASE: Analyzing (Parallel Agent Grid) -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'analyzing'" key="analyzing" class="flex w-full max-w-3xl flex-col items-center">

            <p class="text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
              {{ t('Audit in progress') }}
            </p>
            <h1 class="mt-3 text-5xl font-bold tracking-tight text-(--ui-text-highlighted)">
              {{ t('AI agents analyzing') }}
            </h1>
            <p class="mt-4 text-lg text-(--ui-text-muted)">
              {{ t('All agents are running in parallel') }}
            </p>

            <!-- Agent grid — cards light up as each completes -->
            <div class="mt-10 grid w-full grid-cols-5 gap-3">
              <div
                v-for="agent in ALL_AGENTS"
                :key="agent.key"
                class="flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all duration-500"
                :class="isAgentDone(agent.backendName)
                  ? `${agent.cardClass} scale-[1.02]`
                  : 'border-(--ui-border)/50 bg-(--ui-bg-elevated)/30'"
              >
                <!-- Icon with status -->
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500"
                  :class="isAgentDone(agent.backendName)
                    ? `${agent.iconBgClass}`
                    : 'bg-(--ui-bg-accented)'"
                >
                  <UIcon
                    v-if="isAgentDone(agent.backendName)"
                    name="i-lucide-check"
                    class="h-6 w-6 text-green-500"
                  />
                  <UIcon
                    v-else
                    :name="agent.icon"
                    class="h-6 w-6 animate-pulse text-(--ui-text-dimmed)"
                  />
                </div>

                <!-- Name -->
                <span
                  class="text-center text-xs font-semibold transition-colors duration-500"
                  :class="isAgentDone(agent.backendName) ? 'text-(--ui-text-highlighted)' : 'text-(--ui-text-dimmed)'"
                >
                  {{ agent.shortName }}
                </span>

                <!-- Status badge -->
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-300"
                  :class="isAgentDone(agent.backendName)
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-(--ui-bg-accented) text-(--ui-text-dimmed)'"
                >
                  {{ isAgentDone(agent.backendName) ? t('Done') : t('Running') }}
                </span>
              </div>
            </div>

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
          <div v-if="phase === 'synthesizing'" key="synthesizing" class="flex w-full max-w-2xl flex-col items-center text-center">

            <!-- Brain icon with orbiting dots -->
            <div class="relative flex h-36 w-36 items-center justify-center">
              <div class="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-indigo-500/30" />
              <div class="absolute inset-2 animate-spin-slow-reverse rounded-full border border-dashed border-purple-500/20" />
              <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                <UIcon name="i-lucide-brain" class="h-12 w-12 text-indigo-400" />
              </div>
            </div>

            <p class="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
              {{ t('Final analysis') }}
            </p>
            <h1 class="mt-3 text-5xl font-bold tracking-tight text-(--ui-text-highlighted)">
              {{ t('Synthesizing insights') }}
            </h1>

            <!-- Rotating insight messages -->
            <Transition name="step-text" mode="out-in">
              <p :key="synthInsightIndex" class="mt-4 text-lg text-(--ui-text-muted)">
                {{ synthInsights[synthInsightIndex] }}
              </p>
            </Transition>

            <!-- Agent connection visualization -->
            <div class="mt-10 grid grid-cols-5 gap-3">
              <div
                v-for="(agent, i) in ALL_AGENTS"
                :key="agent.key"
                class="flex flex-col items-center gap-2 rounded-xl border px-3 py-3 transition-all duration-700"
                :class="synthHighlightIdx === i
                  ? `${agent.cardClass} scale-105`
                  : 'border-(--ui-border)/50 bg-(--ui-bg-elevated)/50 opacity-60'"
              >
                <UIcon :name="agent.icon" class="h-5 w-5 transition-colors duration-500" :class="synthHighlightIdx === i ? agent.iconClass : 'text-(--ui-text-dimmed)'" />
                <span class="text-[10px] font-semibold" :class="synthHighlightIdx === i ? 'text-(--ui-text-highlighted)' : 'text-(--ui-text-dimmed)'">
                  {{ agent.shortName }}
                </span>
              </div>
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

const { allAgents: ALL_AGENTS } = useScanAgents()

const props = defineProps<{
  scan: {
    status: string
    currentStep: string
    stepStatuses: Record<string, ScanStepStatus>
    error: string | null
    agentsCompleted: number
    agentsTotal: number
    completedAgentNames: string[]
  }
}>()

defineEmits<{ retry: [] }>()

const { t } = useI18n()

const PREPARING_STEPS = ['validating', 'scanning', 'extracting'] as const

const STEP_TO_PHASE: Record<string, string> = {
  validating: 'preparing',
  scanning: 'preparing',
  extracting: 'preparing',
  analyzing: 'analyzing',
  synthesizing: 'synthesizing',
  assembling: 'assembling',
}

const phase = computed(() => STEP_TO_PHASE[props.scan.currentStep] ?? 'preparing')

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

function isAgentDone(backendName: string): boolean {
  return props.scan.completedAgentNames.includes(backendName)
}

const agentProgressPct = computed(() => {
  if (props.scan.agentsTotal === 0) return 0
  return Math.round((props.scan.agentsCompleted / props.scan.agentsTotal) * 100)
})

// Synthesizing phase — rotating insights and agent highlights
const synthInsights = computed(() => [
  t('Cross-referencing trust signals with conversion data'),
  t('Comparing persona reactions against technical findings'),
  t('Identifying patterns across all audit categories'),
  t('Calculating weighted scores from specialist and persona data'),
  t('Detecting recurring issues and improvement trends'),
  t('Building your personalized action plan'),
])
const synthInsightIndex = ref(0)
const synthHighlightIdx = ref(0)
let synthInsightTimer: ReturnType<typeof setInterval> | null = null
let synthHighlightTimer: ReturnType<typeof setInterval> | null = null

watch(phase, (val) => {
  if (val === 'synthesizing') {
    synthInsightIndex.value = 0
    synthHighlightIdx.value = 0
    synthInsightTimer = setInterval(() => {
      synthInsightIndex.value = (synthInsightIndex.value + 1) % synthInsights.value.length
    }, 3000)
    synthHighlightTimer = setInterval(() => {
      synthHighlightIdx.value = (synthHighlightIdx.value + 1) % ALL_AGENTS.value.length
    }, 800)
  }
  else {
    if (synthInsightTimer) { clearInterval(synthInsightTimer); synthInsightTimer = null }
    if (synthHighlightTimer) { clearInterval(synthHighlightTimer); synthHighlightTimer = null }
  }
})

onUnmounted(() => {
  if (synthInsightTimer) clearInterval(synthInsightTimer)
  if (synthHighlightTimer) clearInterval(synthHighlightTimer)
})

const glowColor = computed(() => {
  if (phase.value === 'analyzing') {
    // Glow shifts to last completed agent's color
    const names = props.scan.completedAgentNames
    if (names.length > 0) {
      const lastDone = ALL_AGENTS.value.find(a => a.backendName === names[names.length - 1])
      if (lastDone) return lastDone.glow
    }
    return 'rgba(99,102,241,0.2)'
  }
  return PHASE_GLOW[phase.value] ?? PHASE_GLOW.default
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

const STEP_PILL_CLASSES: Record<ScanStepStatus, string> = {
  done: 'border-green-500/30 bg-green-500/10 text-green-500',
  active: 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  failed: 'border-(--ui-border) text-(--ui-text-dimmed)',
  pending: 'border-(--ui-border) text-(--ui-text-dimmed)',
}

const STEP_DOT_CLASSES: Record<ScanStepStatus, string> = {
  done: 'h-1.5 w-5 bg-green-500',
  active: 'h-1.5 w-5 bg-blue-500',
  failed: 'h-1.5 w-1.5 bg-red-500',
  pending: 'h-1.5 w-1.5 bg-(--ui-border)',
}

const PHASE_GLOW: Record<string, string> = {
  synthesizing: 'rgba(129,90,213,0.25)',
  assembling: 'rgba(99,102,241,0.2)',
  default: 'rgba(99,102,241,0.15)',
}

function stepPillClass(key: string): string {
  return STEP_PILL_CLASSES[stepStatus(key)]
}

function stepDotClass(key: string): string {
  return STEP_DOT_CLASSES[stepStatus(key)]
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

/* Synthesizing orbit animations */
@keyframes spin-slow {
  to { transform: rotate(360deg); }
}
@keyframes spin-slow-reverse {
  to { transform: rotate(-360deg); }
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
.animate-spin-slow-reverse {
  animation: spin-slow-reverse 12s linear infinite;
}
</style>
