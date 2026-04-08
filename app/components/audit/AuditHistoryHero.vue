<template>
  <div class="overflow-hidden rounded-2xl border border-(--ui-border) bg-(--ui-bg)">
    <!-- Score + chart area -->
    <div class="p-6" :class="heroGradient">
      <div class="flex flex-col gap-8 sm:flex-row sm:items-start">
        <!-- Left: score + stats -->
        <div class="flex-1">
          <p class="text-xs font-medium uppercase tracking-widest text-(--ui-text-dimmed)">
            {{ t('Current score') }}
          </p>
          <div class="mt-2 flex items-end gap-3">
            <span
              class="text-7xl font-black leading-none tabular-nums"
              :class="props.latestScore != null ? scoreColor(props.latestScore) : 'text-(--ui-text-dimmed)'"
            >
              {{ props.latestScore ?? '--' }}
            </span>
            <div class="mb-2 flex flex-col gap-1">
              <span class="text-sm text-(--ui-text-dimmed)">/100</span>
              <span
                v-if="props.latestScore != null"
                class="text-sm font-semibold"
                :class="scoreColor(props.latestScore)"
              >
                {{ scoreLabel(props.latestScore) }}
              </span>
            </div>
          </div>

          <!-- Stats row -->
          <div class="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            <div v-if="props.bestScore != null && props.completedAuditsCount > 1">
              <p class="text-xs text-(--ui-text-dimmed)">{{ t('Best ever') }}</p>
              <p class="text-base font-bold text-green-500">{{ props.bestScore }}</p>
            </div>
            <div v-if="props.totalImprovement !== 0 && props.completedAuditsCount > 1">
              <p class="text-xs text-(--ui-text-dimmed)">{{ t('Total change') }}</p>
              <p
                class="text-base font-bold"
                :class="props.totalImprovement > 0 ? 'text-green-500' : 'text-red-500'"
              >
                {{ props.totalImprovement > 0 ? '+' : '' }}{{ props.totalImprovement }} pts
              </p>
            </div>
            <div>
              <p class="text-xs text-(--ui-text-dimmed)">{{ t('Total audits') }}</p>
              <p class="text-base font-bold text-(--ui-text-highlighted)">{{ props.completedAuditsCount }}</p>
            </div>
          </div>

        </div>

        <!-- Right: trend chart OR rocket -->
        <div class="flex w-full flex-col items-center justify-center sm:w-56">
          <ScoreTrendChart
            v-if="props.chartAudits.length >= 2"
            :data="props.chartAudits"
            :height="120"
            clickable
            @point-click="(i) => emit('chart-click', i)"
          />
          <template v-else>
            <Vue3Lottie
              animation-link="/animations/RocketLP.json"
              :height="100"
              :width="100"
              :loop="true"
              :auto-play="true"
            />
            <p class="mt-2 text-center text-sm font-medium text-(--ui-text-muted)">
              {{ t('Run more audits to see your trend') }}
            </p>
          </template>
        </div>
      </div>

      <!-- Velocity bar -->
      <div v-if="props.velocity" class="mt-5">
        <AuditVelocity :velocity="props.velocity" />
      </div>
    </div>

    <!-- Bottom strip: URL + actions -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-(--ui-border) bg-(--ui-bg-elevated) px-6 py-3">
      <a
        v-if="props.pageUrl"
        :href="props.pageUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="truncate text-xs text-(--ui-text-muted) transition hover:text-(--ui-primary)"
      >
        {{ props.pageUrl }}
      </a>
      <div class="flex items-center gap-2">
        <UButton
          v-if="props.latestAuditId"
          size="lg"
          variant="outline"
          icon="i-lucide-file-text"
          :to="`/projects/${props.projectId}/pages/${props.pageId}/audits/${props.latestAuditId}`"
        >
          {{ t('See latest report') }}
        </UButton>
        <UButton
          size="lg"
          variant="outline"
          icon="i-lucide-kanban"
          :to="`/projects/${props.projectId}/pages/${props.pageId}/board`"
        >
          {{ t('Issue board') }}
        </UButton>
        <UButton
          size="lg"
          icon="i-lucide-refresh-cw"
          @click="emit('new-audit')"
        >
          {{ t('Re-audit page') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'
import { scoreColor } from '~/constants/audit'
import type { VelocityData } from '~/components/audit/AuditVelocity.vue'

interface Props {
  latestScore: number | null
  bestScore: number | null
  totalImprovement: number
  completedAuditsCount: number
  latestAuditId: string | null
  pageUrl: string | null
  chartAudits: Array<{ overall_score: number, created_at: string }>
  velocity: VelocityData | null
  projectId: string
  pageId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'new-audit': []
  'chart-click': [index: number]
}>()

const { t } = useI18n()
const { scoreLabel } = useScoreLabel()

const heroGradient = computed(() => {
  if (props.latestScore == null) return ''
  if (props.latestScore >= 80) return 'bg-gradient-to-br from-green-500/5 via-transparent to-transparent'
  if (props.latestScore >= 50) return 'bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent'
  return 'bg-gradient-to-br from-red-500/5 via-transparent to-transparent'
})
</script>
