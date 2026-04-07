<template>
  <div class="relative flex w-full flex-col items-center pt-8 pb-16">

    <!-- Dynamic background glow -->
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
      <div class="relative z-10 flex w-full flex-col items-center px-6">

        <!-- PHASE: Preparing (validating) -->
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
            <h1 class="mt-3 text-5xl font-bold tracking-tight text-(--ui-text-highlighted)">
              {{ t('Preparing your audit') }}
            </h1>
            <p class="mt-4 max-w-md text-lg text-(--ui-text-muted)">
              {{ t('Loading your page and setting up the AI auditor') }}
            </p>
          </div>
        </Transition>

        <!-- PHASE: Exploring (AI browsing the page live) -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'exploring'" key="exploring" class="flex w-full flex-col items-center">
            <ExplorationViewer
              :steps="scan.explorationSteps"
              :current-screenshot="scan.currentScreenshot"
            />
          </div>
        </Transition>

        <!-- PHASE: Analyzing (3 sequential passes) -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'analyzing'" key="analyzing" class="flex w-full max-w-2xl flex-col items-center text-center">
            <div class="relative flex h-28 w-28 items-center justify-center">
              <div class="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-indigo-500/30" />
              <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                <UIcon name="i-lucide-brain" class="h-10 w-10 text-indigo-400" />
              </div>
            </div>

            <p class="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
              {{ t('Deep analysis') }}
            </p>
            <Transition name="step-text" mode="out-in">
              <h1 :key="passHeadline" class="mt-3 text-4xl font-bold tracking-tight text-(--ui-text-highlighted)">
                {{ passHeadline }}
              </h1>
            </Transition>
            <p class="mt-4 text-lg text-(--ui-text-muted)">
              {{ passSubtitle }}
            </p>

            <!-- Pass indicators -->
            <!-- Pass indicators: currentPass is 1-based from backend, idx is 0-based -->
            <div class="mt-10 flex items-center gap-4">
              <div
                v-for="(p, idx) in analysisPasses"
                :key="p.key"
                class="flex items-center gap-2.5 rounded-xl border px-5 py-3 transition-all duration-500"
                :class="idx < activePassIdx
                  ? 'border-green-500/30 bg-green-500/5'
                  : idx === activePassIdx
                    ? 'border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                    : 'border-(--ui-border)/50 bg-(--ui-bg-elevated)/30'"
              >
                <UIcon
                  v-if="idx < activePassIdx"
                  name="i-lucide-check-circle-2"
                  class="h-5 w-5 text-green-500"
                />
                <UIcon
                  v-else-if="idx === activePassIdx"
                  name="i-lucide-loader-2"
                  class="h-5 w-5 animate-spin text-indigo-400"
                />
                <UIcon
                  v-else
                  :name="p.icon"
                  class="h-5 w-5 text-(--ui-text-dimmed)"
                />
                <span class="text-sm font-semibold" :class="idx === scan.currentPass ? 'text-(--ui-text-highlighted)' : 'text-(--ui-text-dimmed)'">
                  {{ p.label }}
                </span>
              </div>
            </div>
          </div>
        </Transition>

        <!-- PHASE: Synthesizing -->
        <Transition name="phase" mode="out-in">
          <div v-if="phase === 'synthesizing'" key="synthesizing" class="flex w-full max-w-2xl flex-col items-center text-center">
            <div class="relative flex h-36 w-36 items-center justify-center">
              <div class="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-indigo-500/30" />
              <div class="absolute inset-2 animate-spin-slow-reverse rounded-full border border-dashed border-purple-500/20" />
              <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                <UIcon name="i-lucide-sparkles" class="h-12 w-12 text-indigo-400" />
              </div>
            </div>
            <p class="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
              {{ t('Final analysis') }}
            </p>
            <h1 class="mt-3 text-4xl font-bold tracking-tight text-(--ui-text-highlighted)">
              {{ t('Synthesizing insights') }}
            </h1>
            <p class="mt-4 text-lg text-(--ui-text-muted)">
              {{ t('Combining all findings into a coherent report') }}
            </p>
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

      <!-- Step progress dots -->
      <div class="mt-10 flex items-center justify-center gap-2">
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
import type { ExplorationStep } from '~/stores/scanProgress'
import ExplorationViewer from '~/components/audit/ExplorationViewer.vue'

const props = defineProps<{
  scan: {
    status: string
    currentStep: string
    stepStatuses: Record<string, ScanStepStatus>
    error: string | null
    explorationSteps: ExplorationStep[]
    currentScreenshot: string | null
    currentPass: number
    totalPasses: number
    currentPassName: string | null
  }
}>()

defineEmits<{ retry: [] }>()

const { t } = useI18n()

const STEP_TO_PHASE: Record<string, string> = {
  validating: 'preparing',
  exploring: 'exploring',
  analyzing: 'analyzing',
  synthesizing: 'synthesizing',
  assembling: 'assembling',
}

const phase = computed(() => STEP_TO_PHASE[props.scan.currentStep] ?? 'preparing')

// Convert 1-based backend pass number to 0-based index for the UI
const activePassIdx = computed(() => Math.max(0, (props.scan.currentPass ?? 1) - 1))

const analysisPasses = computed(() => [
  { key: 'deep', icon: 'i-lucide-scan-search', label: t('Deep Analysis') },
  { key: 'persona', icon: 'i-lucide-users', label: t('Persona Simulation') },
])

const passHeadline = computed(() => {
  const map: Record<string, () => string> = {
    deep_analysis: () => t('Analyzing your page'),
    persona_simulation: () => t('Simulating visitor perspectives'),
    brain_synthesis: () => t('Synthesizing insights'),
  }
  return map[props.scan.currentPassName || '']?.() ?? t('Running deep analysis')
})

const passSubtitle = computed(() => {
  const map: Record<string, () => string> = {
    deep_analysis: () => t('Evaluating clarity, trust, conversion, and SEO from exploration data'),
    persona_simulation: () => t('Three visitor personas are reacting to what the AI explored'),
    brain_synthesis: () => t('Combining all findings into a coherent report'),
  }
  return map[props.scan.currentPassName || '']?.() ?? t('Processing exploration findings')
})

const glowColor = computed(() => {
  const colors: Record<string, string> = {
    preparing: 'rgba(99,102,241,0.15)',
    exploring: 'rgba(59,130,246,0.2)',
    analyzing: 'rgba(129,90,213,0.2)',
    synthesizing: 'rgba(129,90,213,0.25)',
    assembling: 'rgba(99,102,241,0.2)',
  }
  return colors[phase.value] ?? colors.preparing
})

function stepStatus(key: string): ScanStepStatus {
  return props.scan.stepStatuses[key] ?? 'pending'
}

const STEP_DOT_CLASSES: Record<ScanStepStatus, string> = {
  done: 'h-1.5 w-5 bg-green-500',
  active: 'h-1.5 w-5 bg-blue-500',
  failed: 'h-1.5 w-1.5 bg-red-500',
  pending: 'h-1.5 w-1.5 bg-(--ui-border)',
}

function stepDotClass(key: string): string {
  return STEP_DOT_CLASSES[stepStatus(key)]
}
</script>

<style scoped>
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
