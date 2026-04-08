<template>
  <div class="flex w-full max-w-5xl flex-col items-center">
    <p class="text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text-dimmed)">
      {{ t('AI auditor is exploring your page') }}
    </p>
    <h1 class="mt-3 text-4xl font-bold tracking-tight text-(--ui-text-highlighted)">
      {{ t('Live exploration') }}
    </h1>

    <!-- Live viewer + action log -->
    <div class="mt-8 flex w-full gap-4">
      <!-- Screenshot viewer — adapts to desktop/mobile/tablet -->
      <div class="flex flex-1 items-start justify-center">
        <Transition name="frame-switch" mode="out-in">
          <!-- Mobile phone frame -->
          <div v-if="viewportMode === 'mobile'" key="mobile" class="relative w-56 overflow-hidden rounded-[2rem] border-4 border-(--ui-border) bg-black shadow-xl">
            <!-- Phone notch -->
            <div class="mx-auto h-5 w-20 rounded-b-xl bg-(--ui-border)" />
            <!-- Screen -->
            <div class="relative aspect-[9/19] w-full bg-(--ui-bg-muted)">
              <Transition name="screenshot-fade" mode="out-in">
                <img
                  v-if="currentScreenshot"
                  :key="screenshotKey"
                  :src="`data:image/jpeg;base64,${currentScreenshot}`"
                  alt="Mobile screenshot"
                  class="absolute inset-0 h-full w-full object-cover object-top"
                />
                <div v-else class="flex h-full items-center justify-center">
                  <UIcon name="i-lucide-smartphone" class="h-8 w-8 animate-pulse text-(--ui-text-dimmed)" />
                </div>
              </Transition>
            </div>
            <!-- Home indicator -->
            <div class="flex justify-center py-2">
              <div class="h-1 w-16 rounded-full bg-(--ui-border)" />
            </div>
          </div>

          <!-- Tablet frame -->
          <div v-else-if="viewportMode === 'tablet'" key="tablet" class="relative w-80 overflow-hidden rounded-[1.5rem] border-4 border-(--ui-border) bg-black shadow-xl">
            <div class="relative aspect-[3/4] w-full bg-(--ui-bg-muted)">
              <Transition name="screenshot-fade" mode="out-in">
                <img
                  v-if="currentScreenshot"
                  :key="screenshotKey"
                  :src="`data:image/jpeg;base64,${currentScreenshot}`"
                  alt="Tablet screenshot"
                  class="absolute inset-0 h-full w-full object-cover object-top"
                />
                <div v-else class="flex h-full items-center justify-center">
                  <UIcon name="i-lucide-tablet" class="h-8 w-8 animate-pulse text-(--ui-text-dimmed)" />
                </div>
              </Transition>
            </div>
            <div class="flex justify-center py-1.5">
              <div class="h-1 w-12 rounded-full bg-(--ui-border)" />
            </div>
          </div>

          <!-- Desktop browser frame (default) -->
          <div v-else key="desktop" class="relative w-full overflow-hidden rounded-2xl border border-(--ui-border) bg-black/5">
            <!-- Browser chrome bar -->
            <div class="flex items-center gap-2 border-b border-(--ui-border)/50 bg-(--ui-bg-elevated) px-4 py-2.5">
              <div class="flex gap-1.5">
                <div class="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div class="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <div class="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              </div>
              <div class="ml-3 flex-1 rounded-md bg-(--ui-bg-accented) px-3 py-1 text-xs text-(--ui-text-dimmed) truncate">
                {{ url }}
              </div>
            </div>
            <!-- Screenshot area -->
            <div class="relative aspect-[16/10] w-full bg-(--ui-bg-muted)">
              <Transition name="screenshot-fade" mode="out-in">
                <img
                  v-if="currentScreenshot"
                  :key="screenshotKey"
                  :src="`data:image/jpeg;base64,${currentScreenshot}`"
                  alt="Desktop screenshot"
                  class="absolute inset-0 h-full w-full object-cover object-top"
                />
                <div v-else class="flex h-full items-center justify-center">
                  <div class="flex flex-col items-center gap-3">
                    <UIcon name="i-lucide-scan" class="h-10 w-10 animate-pulse text-(--ui-text-dimmed)" />
                    <span class="text-sm text-(--ui-text-dimmed)">{{ t('Waiting for first screenshot...') }}</span>
                  </div>
                </div>
              </Transition>

              <!-- Desktop action overlay -->
              <Transition name="step-text" mode="out-in">
                <div
                  v-if="latestAction"
                  :key="latestAction"
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
                >
                  <div class="flex items-center gap-2">
                    <UIcon :name="actionIcon" class="h-4 w-4 text-white/80" />
                    <span class="text-sm font-medium text-white">{{ latestAction }}</span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Action log sidebar -->
      <div class="flex w-72 flex-col rounded-2xl border border-(--ui-border) bg-(--ui-bg-elevated)">
        <div class="border-b border-(--ui-border)/50 px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-(--ui-text-dimmed)">{{ t('Activity') }}</span>
            <UBadge v-if="findingCount > 0" color="warning" variant="subtle" size="xs">
              {{ findingCount }} {{ findingCount === 1 ? t('issue') : t('issues') }}
            </UBadge>
          </div>
        </div>

        <div ref="logContainer" class="flex-1 space-y-0.5 overflow-y-auto p-2" style="max-height: 400px;">
          <TransitionGroup name="log-item">
            <div
              v-for="step in steps"
              :key="step.stepNumber"
              class="flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
              :class="step.finding ? 'bg-amber-500/5' : ''"
            >
              <div class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="step.finding
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-(--ui-bg-accented) text-(--ui-text-dimmed)'"
              >
                {{ step.finding ? '!' : step.stepNumber }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-medium leading-tight" :class="step.finding ? 'text-amber-500' : 'text-(--ui-text-highlighted)'">
                  {{ step.finding ? step.finding.title : step.description }}
                </p>
                <p v-if="step.finding" class="mt-0.5 text-[10px] text-(--ui-text-dimmed)">
                  {{ step.finding.category }} &middot; {{ step.finding.severity }}
                </p>
                <p v-else class="mt-0.5 text-[10px] text-(--ui-text-dimmed)">
                  {{ actionLabel(step.action) }}
                </p>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="steps.length === 0" class="flex flex-col items-center py-8 text-center">
            <UIcon name="i-lucide-compass" class="h-6 w-6 animate-spin text-(--ui-text-dimmed)" style="animation-duration: 3s" />
            <span class="mt-2 text-xs text-(--ui-text-dimmed)">{{ t('Starting exploration...') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Findings counter -->
    <div v-if="findingCount > 0" class="mt-6 flex items-center justify-center gap-2 text-sm text-(--ui-text-muted)">
      <UIcon name="i-lucide-alert-triangle" class="h-4 w-4 text-amber-500" />
      <span class="font-medium">{{ findingCount }} {{ findingCount === 1 ? t('issue found so far') : t('issues found so far') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExplorationStep } from '~/stores/scanProgress'

const props = defineProps<{
  steps: ExplorationStep[]
  currentScreenshot: string | null
  url?: string
}>()

const { t } = useI18n()
const logContainer = ref<HTMLElement>()

const findingCount = computed(() => {
  if (props.steps.length === 0) return 0
  return props.steps[props.steps.length - 1].findingCount
})

const latestAction = computed(() => {
  if (props.steps.length === 0) return null
  return props.steps[props.steps.length - 1].description
})

// Detect current viewport mode from the latest visual action
const viewportMode = computed<'desktop' | 'mobile' | 'tablet'>(() => {
  // Walk backwards through steps to find the most recent viewport-changing action
  for (let i = props.steps.length - 1; i >= 0; i--) {
    const action = props.steps[i].action
    if (action === 'check_mobile_view') return 'mobile'
    if (action === 'check_tablet_view') return 'tablet'
    // Any scroll or click means we're back to desktop (viewport was restored)
    if (action === 'scroll_down' || action === 'scroll_to_section' || action === 'click_element') return 'desktop'
  }
  return 'desktop'
})

// Only trigger screenshot transition when the actual image changes (not on every step)
const screenshotKey = computed(() => {
  // Count steps that had screenshots
  return props.steps.filter(s => s.screenshotThumbnail).length
})

const actionIcon = computed(() => {
  if (props.steps.length === 0) return 'i-lucide-scan'
  const action = props.steps[props.steps.length - 1].action
  const icons: Record<string, string> = {
    scroll_down: 'i-lucide-arrow-down',
    scroll_to_section: 'i-lucide-navigation',
    click_element: 'i-lucide-mouse-pointer-click',
    read_visible_text: 'i-lucide-book-open',
    check_mobile_view: 'i-lucide-smartphone',
    check_tablet_view: 'i-lucide-tablet',
    hover_element: 'i-lucide-hand',
    check_link: 'i-lucide-link',
    inspect_form: 'i-lucide-clipboard-list',
    note_finding: 'i-lucide-alert-triangle',
    done: 'i-lucide-check-circle',
    initial_load: 'i-lucide-globe',
    observation: 'i-lucide-eye',
  }
  return icons[action] || 'i-lucide-scan'
})

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    scroll_down: t('Scrolling page'),
    scroll_to_section: t('Navigating to section'),
    click_element: t('Clicking element'),
    read_visible_text: t('Reading content'),
    check_mobile_view: t('Checking mobile'),
    check_tablet_view: t('Checking tablet'),
    hover_element: t('Hovering element'),
    check_link: t('Verifying link'),
    inspect_form: t('Inspecting form'),
    note_finding: t('Issue recorded'),
    done: t('Exploration complete'),
    initial_load: t('Page loaded'),
    observation: t('Observing'),
    error: t('Step failed'),
    fixed_verification: t('Verifying fix'),
  }
  // Convert any unknown snake_case keys to readable labels
  return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Auto-scroll log to bottom
watch(() => props.steps.length, () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.screenshot-fade-enter-active,
.screenshot-fade-leave-active {
  transition: opacity 0.4s ease;
}
.screenshot-fade-enter-from,
.screenshot-fade-leave-to {
  opacity: 0;
}

.log-item-enter-active {
  transition: all 0.3s ease;
}
.log-item-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.step-text-enter-active,
.step-text-leave-active {
  transition: opacity 0.2s ease;
}
.step-text-enter-from,
.step-text-leave-to {
  opacity: 0;
}

.frame-switch-enter-active,
.frame-switch-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.frame-switch-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.frame-switch-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
