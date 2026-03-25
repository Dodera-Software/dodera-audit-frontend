<template>
  <div class="mx-auto max-w-lg py-12">
    <!-- Header -->
    <div class="text-center">
      <h2 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">
        {{ state.status === 'failed' ? t('Scan failed') : t('Scanning your page...') }}
      </h2>
      <p v-if="state.status === 'scanning'" class="mt-2 text-(--ui-text-muted)">
        {{ t('Estimated time remaining') }}: {{ formatDuration(state.estimatedSecondsRemaining) }}
      </p>
    </div>

    <!-- Steps -->
    <div class="mt-10 space-y-4">
      <div
        v-for="step in SCAN_STEPS"
        :key="step.key"
        class="flex items-center gap-4 rounded-lg border p-4 transition-all duration-300"
        :class="STEP_CONTAINER_CLASSES[stepStatus(step.key)]"
      >
        <!-- Icon -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300"
          :class="STEP_ICON_CLASSES[stepStatus(step.key)]"
        >
          <UIcon
            v-if="stepStatus(step.key) === 'done'"
            name="i-lucide-check"
            class="h-5 w-5"
          />
          <UIcon
            v-else-if="stepStatus(step.key) === 'failed'"
            name="i-lucide-x"
            class="h-5 w-5"
          />
          <UIcon
            v-else-if="stepStatus(step.key) === 'active'"
            name="i-lucide-loader-2"
            class="h-5 w-5 animate-spin"
          />
          <UIcon
            v-else
            :name="step.icon"
            class="h-5 w-5"
          />
        </div>

        <!-- Label + agent progress -->
        <div class="flex-1">
          <span
            class="font-medium transition-colors duration-300"
            :class="STEP_TEXT_CLASSES[stepStatus(step.key)]"
          >
            {{ stepLabel(step.key) }}
          </span>
          <div
            v-if="step.key === 'analyzing' && stepStatus(step.key) === 'active' && state.agentsCompleted > 0"
            class="mt-1 flex items-center gap-2"
          >
            <UProgress
              :value="(state.agentsCompleted / state.agentsTotal) * 100"
              size="xs"
              class="flex-1"
            />
            <span class="shrink-0 text-xs text-(--ui-text-muted)">
              {{ state.agentsCompleted }}/{{ state.agentsTotal }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="state.status === 'failed'" class="mt-8 text-center">
      <UAlert
        color="error"
        variant="subtle"
        :title="state.error || t('Something went wrong during the scan.')"
        icon="i-lucide-alert-circle"
      />
      <UButton class="mt-4" icon="i-lucide-refresh-cw" @click="$emit('retry')">
        {{ t('Retry scan') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SCAN_STEPS } from '~/constants/scan'
import type { ScanStepStatus } from '~/constants/scan'

const props = defineProps<{
  state: {
    status: string
    currentStep: string | null
    stepStatuses: Record<string, ScanStepStatus>
    error: string | null
    estimatedSecondsRemaining: number
    agentsCompleted: number
    agentsTotal: number
  }
}>()

defineEmits<{
  retry: []
}>()

const { t } = useI18n()
const { formatDuration } = useFormatters()

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

function stepStatus(key: string): ScanStepStatus {
  return props.state.stepStatuses[key] ?? 'pending'
}

const STEP_CONTAINER_CLASSES: Record<ScanStepStatus, string> = {
  pending: 'border-(--ui-border) opacity-50',
  active: 'border-blue-500 bg-blue-500/5',
  done: 'border-green-500/30 bg-green-500/5',
  failed: 'border-red-500/30 bg-red-500/5',
}

const STEP_ICON_CLASSES: Record<ScanStepStatus, string> = {
  pending: 'bg-(--ui-bg-elevated) text-(--ui-text-muted)',
  active: 'bg-blue-500/20 text-blue-500',
  done: 'bg-green-500/20 text-green-500',
  failed: 'bg-red-500/20 text-red-500',
}

const STEP_TEXT_CLASSES: Record<ScanStepStatus, string> = {
  pending: 'text-(--ui-text-muted)',
  active: 'text-(--ui-text-highlighted)',
  done: 'text-green-500',
  failed: 'text-red-500',
}
</script>
