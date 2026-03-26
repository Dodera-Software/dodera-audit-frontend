<template>
  <div class="mx-auto w-full max-w-lg px-4 py-8">
    <!-- Header: Lottie + text — fixed height to prevent layout shift -->
    <div v-if="scan.status !== 'failed'" class="flex flex-col items-center" style="min-height: 260px">
      <Vue3Lottie
        animation-link="/animations/searching.json"
        :height="160"
        :width="160"
        :loop="true"
        :auto-play="true"
      />
      <h2 class="mt-4 text-2xl font-bold text-(--ui-text-highlighted)">
        {{ t('Auditing your page...') }}
      </h2>
      <p class="mt-1.5 h-10 text-center text-sm text-(--ui-text-muted)">
        {{ stepDescription(scan.currentStep ?? 'validating') }}
      </p>
    </div>

    <!-- Failed header -->
    <div v-else class="flex flex-col items-center" style="min-height: 260px">
      <div class="flex h-24 w-24 items-center justify-center rounded-2xl bg-red-500/10">
        <UIcon name="i-lucide-alert-circle" class="h-12 w-12 text-red-500" />
      </div>
      <h2 class="mt-4 text-2xl font-bold text-(--ui-text-highlighted)">
        {{ t('Scan failed') }}
      </h2>
    </div>

    <!-- Steps timeline -->
    <div class="relative mx-auto mt-6 max-w-sm pl-4">
      <div class="absolute bottom-0 left-[27px] top-0 w-px bg-(--ui-border)" />

      <div v-for="step in SCAN_STEPS" :key="step.key" class="relative flex items-start gap-4 pb-5 last:pb-0">
        <!-- Node -->
        <div
          class="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500"
          :class="nodeClass(step.key)"
        >
          <UIcon v-if="stepStatus(step.key) === 'done'" name="i-lucide-check" class="h-3 w-3 text-green-500" />
          <UIcon v-else-if="stepStatus(step.key) === 'active'" name="i-lucide-loader-2" class="h-3 w-3 animate-spin text-blue-500" />
          <UIcon v-else-if="stepStatus(step.key) === 'failed'" name="i-lucide-x" class="h-3 w-3 text-red-500" />
          <div v-else class="h-1.5 w-1.5 rounded-full bg-(--ui-text-dimmed)" />
        </div>

        <!-- Content -->
        <div class="flex-1 pt-0.5">
          <span class="text-sm font-medium transition-colors duration-300" :class="textClass(step.key)">
            {{ stepLabel(step.key) }}
          </span>

          <!-- Agent roster -->
          <div
            v-if="step.key === 'analyzing' && stepStatus(step.key) === 'active'"
            class="mt-3 grid grid-cols-2 gap-2"
          >
            <div
              v-for="(agent, j) in ANALYSIS_AGENTS"
              :key="agent.key"
              class="flex items-center gap-2 rounded-lg border p-2 transition-all duration-500"
              :class="agentCardClass(j)"
            >
              <UIcon :name="agent.icon" class="h-3.5 w-3.5 shrink-0" />
              <span class="truncate text-xs font-medium">{{ agentName(agent.key) }}</span>
              <UIcon v-if="j < scan.agentsCompleted" name="i-lucide-check" class="ml-auto h-3 w-3 shrink-0 text-green-500" />
              <UIcon v-else-if="j === scan.agentsCompleted" name="i-lucide-loader-2" class="ml-auto h-3 w-3 shrink-0 animate-spin text-blue-500" />
            </div>
          </div>

          <p v-if="step.key === 'analyzing' && stepStatus(step.key) === 'done'" class="mt-0.5 text-xs text-green-500">
            {{ scan.agentsTotal }}/{{ scan.agentsTotal }} {{ t('agents complete') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Progress bar — bottom, anchored -->
    <div class="mx-auto mt-8 max-w-sm">
      <div class="flex items-center justify-between text-xs text-(--ui-text-dimmed)">
        <span>{{ overallProgress }}%</span>
      </div>
      <UProgress :value="overallProgress" size="xs" class="mt-1" />
    </div>

    <!-- Error -->
    <div v-if="scan.status === 'failed'" class="mx-auto mt-6 max-w-sm text-center">
      <UAlert
        color="error"
        variant="subtle"
        :title="scan.error || t('Something went wrong during the scan.')"
        icon="i-lucide-alert-circle"
      />
      <UButton class="mt-4" icon="i-lucide-refresh-cw" @click="$emit('retry')">
        {{ t('Retry scan') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'
import { SCAN_STEPS, SCAN_STEP_KEYS, ANALYSIS_AGENTS } from '~/constants/scan'
import type { ScanStepStatus } from '~/constants/scan'

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

defineEmits<{
  retry: []
}>()

const { t } = useI18n()

function stepLabel(key: string): string {
  const labels: Record<string, () => string> = {
    validating: () => t('Validating URL'),
    scanning: () => t('Loading page in browser'),
    extracting: () => t('Extracting content'),
    analyzing: () => t('Running AI analysis'),
    assembling: () => t('Assembling report'),
  }
  return labels[key]?.() ?? key
}

function stepDescription(key: string): string {
  const descriptions: Record<string, () => string> = {
    validating: () => t('Checking that your page is reachable and loads correctly'),
    scanning: () => t('Opening your page in a real browser to capture what visitors see'),
    extracting: () => t('Pulling out headings, CTAs, trust signals, and page structure'),
    analyzing: () => t('Seven AI personas are evaluating your page right now'),
    assembling: () => t('Combining all findings into your scored report'),
  }
  return descriptions[key]?.() ?? ''
}

function agentName(key: string): string {
  const names: Record<string, () => string> = {
    visual: () => t('Visual Analyst'),
    trust: () => t('Trust Auditor'),
    conversion: () => t('Conversion Critic'),
    code: () => t('Code Inspector'),
    skeptic: () => t('The Skeptic'),
    impulse: () => t('The Impulse Visitor'),
    comparison: () => t('The Comparison Shopper'),
  }
  return names[key]?.() ?? key
}

function stepStatus(key: string): ScanStepStatus {
  return props.scan.stepStatuses[key] ?? 'pending'
}

const overallProgress = computed(() => {
  const activeIndex = props.scan.currentStep
    ? SCAN_STEP_KEYS.indexOf(props.scan.currentStep)
    : 0

  if (props.scan.currentStep === 'analyzing' && props.scan.agentsTotal > 0) {
    const stepProgress = props.scan.agentsCompleted / props.scan.agentsTotal
    return Math.round(((activeIndex + stepProgress) / SCAN_STEP_KEYS.length) * 100)
  }

  const doneCount = SCAN_STEP_KEYS.filter(k => props.scan.stepStatuses[k] === 'done').length
  if (doneCount === SCAN_STEP_KEYS.length) return 100

  return Math.round(((activeIndex + 0.5) / SCAN_STEP_KEYS.length) * 100)
})

function nodeClass(key: string): string {
  const status = stepStatus(key)
  if (status === 'done') return 'border-green-500 bg-green-500/10'
  if (status === 'active') return 'border-blue-500 bg-blue-500/10'
  if (status === 'failed') return 'border-red-500 bg-red-500/10'
  return 'border-(--ui-border) bg-(--ui-bg)'
}

function textClass(key: string): string {
  const status = stepStatus(key)
  if (status === 'done') return 'text-green-500'
  if (status === 'active') return 'text-(--ui-text-highlighted)'
  if (status === 'failed') return 'text-red-500'
  return 'text-(--ui-text-dimmed)'
}

function agentCardClass(index: number): string {
  if (index < props.scan.agentsCompleted) return 'border-green-500/30 bg-green-500/5 text-green-600'
  if (index === props.scan.agentsCompleted) return 'border-blue-500 bg-blue-500/5 text-(--ui-text-highlighted)'
  return 'border-(--ui-border) text-(--ui-text-dimmed) opacity-50'
}
</script>
