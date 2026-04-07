<template>
  <UCard class="transition-all duration-200">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--ui-bg-elevated)"
        :class="meta.color"
      >
        <UIcon :name="meta.icon" class="h-5 w-5" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-(--ui-text-highlighted)">{{ personaName }}</h3>
        <p class="text-xs text-(--ui-text-muted)">{{ personaDescription }}</p>
      </div>
      <UBadge :color="verdictConfig.color" variant="subtle">
        <UIcon :name="verdictConfig.icon" class="mr-1 h-3 w-3" />
        {{ verdictLabel }}
      </UBadge>
    </div>

    <!-- Narrative excerpt -->
    <div class="mt-4">
      <p class="line-clamp-4 text-sm italic text-(--ui-text-muted)">
        "{{ narrativeExcerpt }}"
      </p>
      <UButton variant="link" size="xs" @click="showModal = true">
        {{ t('Read full narrative') }}
      </UButton>
    </div>

    <!-- Top issue -->
    <div v-if="persona.top_issue" class="mt-3 rounded-md bg-(--ui-bg-elevated) p-2.5">
      <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Top concern') }}</p>
      <p class="mt-0.5 text-sm text-(--ui-text-highlighted)">{{ persona.top_issue }}</p>
    </div>

    <!-- Full narrative modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <div class="flex max-h-[85vh] flex-col">
          <div class="flex shrink-0 items-center gap-3 border-b border-(--ui-border) px-6 py-4">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-(--ui-bg-elevated)"
              :class="meta.color"
            >
              <UIcon :name="meta.icon" class="h-4 w-4" />
            </div>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ personaName }}</h3>
            <UBadge :color="verdictConfig.color" variant="subtle" size="xs">
              {{ verdictLabel }}
            </UBadge>
          </div>
          <div class="overflow-y-auto px-6 py-5">
            <!-- Key moments at the top -->
            <div v-if="persona.moments?.length" class="mb-6">
              <h4 class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Key moments') }}</h4>
              <div class="mt-3 space-y-2">
                <div v-for="(moment, idx) in persona.moments" :key="idx" class="flex items-start gap-3 rounded-lg bg-(--ui-bg-elevated) px-3 py-2.5">
                  <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    :class="momentClass(moment.moment_type)"
                  >
                    <UIcon :name="momentIcon(moment.moment_type)" class="h-3 w-3" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ moment.description }}</p>
                    <p class="mt-0.5 text-xs text-(--ui-text-dimmed)">{{ moment.element }} · {{ momentLabel(moment.moment_type) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Full narrative -->
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Full narrative') }}</h4>
              <div class="mt-3 space-y-3 text-sm leading-relaxed text-(--ui-text)">
                <p v-for="(para, idx) in narrativeParagraphs" :key="idx">{{ para }}</p>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 justify-end border-t border-(--ui-border) px-6 py-4">
            <UButton variant="ghost" @click="showModal = false">{{ t('Close') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { PERSONA_META, VERDICT_CONFIG } from '~/constants/persona'
import type { VerdictKey } from '~/constants/persona'

const props = defineProps<{
  persona: {
    persona: string
    narrative: string
    scores: { trust: number, clarity: number, action_intent: number }
    would_convert: string
    top_issue?: string
    confidence?: number
    moments?: Array<{ element: string, moment_type: string, description: string, timestamp_seconds: number }>
  }
  isLowestIntent: boolean
}>()

const { t } = useI18n()
const showModal = ref(false)

const meta = computed(() => PERSONA_META[props.persona.persona] ?? PERSONA_META.skeptic)

const personaName = computed(() => {
  const names: Record<string, () => string> = {
    skeptic: () => t('The Skeptic'),
    impulse: () => t('The Impulse Visitor'),
    comparison: () => t('The Comparison Shopper'),
  }
  return names[props.persona.persona]?.() ?? props.persona.persona
})

const personaDescription = computed(() => {
  const descriptions: Record<string, () => string> = {
    skeptic: () => t('Needs proof before trusting any claim'),
    impulse: () => t('Decides in seconds based on first impression'),
    comparison: () => t('Evaluates multiple options before committing'),
  }
  return descriptions[props.persona.persona]?.() ?? ''
})

const verdictConfig = computed(() => {
  const key = props.persona.would_convert as VerdictKey
  return VERDICT_CONFIG[key] ?? VERDICT_CONFIG.maybe
})

const verdictLabel = computed(() => {
  const labels: Record<string, () => string> = {
    yes: () => t('Would convert'),
    no: () => t('Would not convert'),
    maybe: () => t('Uncertain'),
  }
  return labels[props.persona.would_convert]?.() ?? t('Uncertain')
})

const narrativeExcerpt = computed(() => {
  const sentences = props.persona.narrative.split(/(?<=[.!?])\s+/)
  return sentences.slice(0, 3).join(' ')
})

const narrativeParagraphs = computed(() => {
  // Split into paragraphs by double newline or every ~3 sentences
  const text = props.persona.narrative
  if (text.includes('\n\n')) {
    return text.split('\n\n').filter(p => p.trim())
  }
  // Split into chunks of ~3 sentences for readability
  const sentences = text.split(/(?<=[.!?])\s+/)
  const paragraphs: string[] = []
  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(' '))
  }
  return paragraphs
})

function momentIcon(type: string): string {
  const icons: Record<string, string> = {
    trust_gain: 'i-lucide-shield-check',
    conversion: 'i-lucide-check',
    hesitation: 'i-lucide-pause',
    confusion: 'i-lucide-help-circle',
    trust_loss: 'i-lucide-shield-x',
    exit_intent: 'i-lucide-log-out',
  }
  return icons[type] ?? 'i-lucide-circle'
}

function momentClass(type: string): string {
  const classes: Record<string, string> = {
    trust_gain: 'bg-green-500/15 text-green-500',
    conversion: 'bg-green-500/15 text-green-500',
    hesitation: 'bg-amber-500/15 text-amber-500',
    confusion: 'bg-amber-500/15 text-amber-500',
    trust_loss: 'bg-red-500/15 text-red-500',
    exit_intent: 'bg-red-500/15 text-red-500',
  }
  return classes[type] ?? 'bg-(--ui-bg-accented) text-(--ui-text-dimmed)'
}

function momentLabel(type: string): string {
  const labels: Record<string, string> = {
    trust_gain: t('Trust gained'),
    conversion: t('Conversion moment'),
    hesitation: t('Hesitation'),
    confusion: t('Confusion'),
    trust_loss: t('Trust lost'),
    exit_intent: t('Exit intent'),
  }
  return labels[type] ?? type
}
</script>
