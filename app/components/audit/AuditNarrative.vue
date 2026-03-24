<template>
  <UCard class="border-l-4 border-l-purple-500">
    <div class="flex items-start gap-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
        <UIcon name="i-lucide-brain" class="h-5 w-5" />
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <h3 class="font-semibold text-(--ui-text-highlighted)">{{ t("Your Brain's assessment") }}</h3>
          <UBadge v-if="momentum" :color="momentumColor" variant="subtle">
            <UIcon :name="momentumIcon" class="mr-1 h-3 w-3" />
            {{ momentumLabel }}
          </UBadge>
        </div>

        <!-- First audit baseline -->
        <div v-if="isFirstAudit" class="mt-2">
          <p class="text-sm text-(--ui-text-muted)">
            {{ t('First audit baseline — run more audits to see your progress story.') }}
          </p>
        </div>

        <!-- Narrative -->
        <div v-else-if="narrative" class="mt-2">
          <p class="whitespace-pre-line text-sm leading-relaxed text-(--ui-text)">
            {{ narrative }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  narrative: string | null
  momentum: string | null
  isFirstAudit: boolean
}>()

const { t } = useI18n()

const MOMENTUM_CONFIG: Record<string, { color: any, icon: string, label: () => string }> = {
  improving: { color: 'success', icon: 'i-lucide-trending-up', label: () => t('Improving') },
  plateau: { color: 'warning', icon: 'i-lucide-minus', label: () => t('Plateau') },
  regressing: { color: 'error', icon: 'i-lucide-trending-down', label: () => t('Regressing') },
}

const momentumColor = computed(() => MOMENTUM_CONFIG[props.momentum ?? '']?.color ?? 'neutral')
const momentumIcon = computed(() => MOMENTUM_CONFIG[props.momentum ?? '']?.icon ?? 'i-lucide-minus')
const momentumLabel = computed(() => MOMENTUM_CONFIG[props.momentum ?? '']?.label() ?? props.momentum)
</script>
