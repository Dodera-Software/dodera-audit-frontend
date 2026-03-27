<template>
  <UCard
    class="transition-all duration-200"
    :class="isLowestIntent ? 'border-2 border-amber-400/60' : ''"
  >
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
      <div class="flex shrink-0 flex-col items-end gap-1">
        <UBadge :color="verdictConfig.color" variant="subtle">
          <UIcon :name="verdictConfig.icon" class="mr-1 h-3 w-3" />
          {{ verdictLabel }}
        </UBadge>
        <UTooltip v-if="lowConfidence" :text="t('Limited page data — findings may be less accurate')">
          <UBadge color="neutral" variant="subtle" class="cursor-default">
            <UIcon name="i-lucide-signal-low" class="mr-1 h-3 w-3" />
            {{ t('Low confidence') }}
          </UBadge>
        </UTooltip>
      </div>
    </div>

    <!-- Scores -->
    <div class="mt-4 flex gap-4">
      <div v-for="score in scoreEntries" :key="score.key" class="flex-1 text-center">
        <p class="text-xs text-(--ui-text-muted)">{{ score.label }}</p>
        <p class="text-lg font-bold tabular-nums" :class="scoreColor(score.value)">{{ score.value }}</p>
      </div>
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
      <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Top issue') }}</p>
      <p class="mt-0.5 text-sm text-(--ui-text-highlighted)">{{ persona.top_issue }}</p>
    </div>

    <!-- Full narrative modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <div class="p-6">
          <div class="mb-4 flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-(--ui-bg-elevated)"
              :class="meta.color"
            >
              <UIcon :name="meta.icon" class="h-4 w-4" />
            </div>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ personaName }}</h3>
          </div>
          <p class="whitespace-pre-line text-sm leading-relaxed text-(--ui-text)">{{ persona.narrative }}</p>
          <div class="mt-6 flex justify-end">
            <UButton variant="ghost" @click="showModal = false">{{ t('Close') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { scoreColor } from '~/constants/audit'
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

const scoreEntries = computed(() => [
  { key: 'trust', label: t('Trust'), value: props.persona.scores.trust },
  { key: 'clarity', label: t('Clarity'), value: props.persona.scores.clarity },
  { key: 'action_intent', label: t('Action'), value: props.persona.scores.action_intent },
])

const narrativeExcerpt = computed(() => {
  const sentences = props.persona.narrative.split(/(?<=[.!?])\s+/)
  return sentences.slice(0, 3).join(' ')
})

const lowConfidence = computed(() => {
  return props.persona.confidence !== undefined && props.persona.confidence < 80
})
</script>
