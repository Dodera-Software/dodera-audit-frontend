<template>
  <ClientOnly>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else-if="audit">
      <!-- Back link + header -->
      <div class="mb-8 flex items-center gap-4">
        <UButton
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="`/projects/${projectId}`"
        />
        <div>
          <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Audit Report') }}</h1>
          <p class="text-sm text-(--ui-text-muted)">
            {{ formatDateTime(audit.created_at) }}
            <span v-if="audit.scan_duration_ms" class="ml-2">
              {{ t('Scan') }}: {{ formatMs(audit.scan_duration_ms) }}
            </span>
            <span v-if="audit.analysis_duration_ms" class="ml-2">
              {{ t('Analysis') }}: {{ formatMs(audit.analysis_duration_ms) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="audit.warnings?.length" class="mb-6 space-y-2">
        <UAlert
          v-for="(warning, i) in audit.warnings"
          :key="i"
          color="warning"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="warningTitle(warning.type)"
          :description="warning.message"
        />
      </div>

      <!-- Score dashboard (only when scores exist) -->
      <ScoreDashboard
        v-if="audit.overall_score != null && audit.scores"
        :overall-score="audit.overall_score"
        :scores="audit.scores"
        :delta="delta"
        :score-history="scoreHistory"
      />

      <!-- No scores yet -->
      <UCard v-else class="mt-4 py-8 text-center">
        <UIcon name="i-lucide-brain" class="mx-auto h-10 w-10 text-(--ui-text-muted)" />
        <p class="mt-3 text-sm text-(--ui-text-muted)">
          {{ t('Scores are not available for this audit.') }}
        </p>
      </UCard>

      <!-- Persona verdict cards -->
      <div v-if="personaOutputs.length" class="mt-10">
        <h2 class="mb-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Persona verdicts') }}</h2>
        <div class="grid gap-6 lg:grid-cols-3">
          <PersonaCard
            v-for="persona in personaOutputs"
            :key="persona.persona"
            :persona="persona"
            :is-lowest-intent="persona.persona === lowestIntentPersona"
          />
        </div>
      </div>
    </div>

    <div v-else class="py-16 text-center">
      <UIcon name="i-lucide-alert-circle" class="mx-auto h-10 w-10 text-(--ui-text-muted)" />
      <p class="mt-3 text-(--ui-text-muted)">{{ t('Audit not found.') }}</p>
      <UButton class="mt-4" variant="ghost" :to="`/projects/${projectId}`">
        {{ t('Back to project') }}
      </UButton>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import ScoreDashboard from '~/components/audit/ScoreDashboard.vue'
import PersonaCard from '~/components/audit/PersonaCard.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { formatDateTime, formatMs } = useFormatters()

const projectId = route.params.id as string
const auditId = route.params.auditId as string

interface AuditWarning {
  type: string
  message: string
  agent?: string
}

interface PersonaOutput {
  persona: string
  narrative: string
  scores: { trust: number, clarity: number, action_intent: number }
  would_convert: string
  top_issue?: string
}

interface PersonaOutputEntry {
  agent: string
  output: PersonaOutput
  tokens_used: number
  duration_ms: number
}

interface AuditDetail {
  id: string
  status: string
  trigger_type: string
  overall_score: number | null
  scores: Record<string, number> | null
  annotations: any[] | null
  persona_outputs: PersonaOutputEntry[] | null
  warnings: AuditWarning[] | null
  scan_duration_ms: number | null
  analysis_duration_ms: number | null
  created_at: string
  completed_at: string | null
}

interface ScoreHistoryEntry {
  overall_score: number
  created_at: string
}

const audit = ref<AuditDetail | null>(null)
const delta = ref<{ overall: number | null, scores: Record<string, number | null> } | null>(null)
const scoreHistory = ref<ScoreHistoryEntry[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadAudit()
})

async function loadAudit() {
  try {
    const data = await $api<{
      data: AuditDetail
      delta: { overall: number | null, scores: Record<string, number | null> }
      score_history: ScoreHistoryEntry[]
    }>(`/audits/${auditId}`)

    audit.value = data.data
    delta.value = data.delta
    scoreHistory.value = data.score_history
  }
  catch (e) {
    apiError.parse(e, t('Failed to load audit.'))
  }
  finally {
    loading.value = false
  }
}

const personaOutputs = computed<PersonaOutput[]>(() => {
  if (!audit.value?.persona_outputs) return []
  return audit.value.persona_outputs.map(entry => entry.output)
})

const lowestIntentPersona = computed<string | null>(() => {
  if (personaOutputs.value.length === 0) return null

  let lowest: PersonaOutput | null = null
  for (const p of personaOutputs.value) {
    if (!lowest || p.scores.action_intent < lowest.scores.action_intent) {
      lowest = p
    }
  }
  return lowest?.persona ?? null
})

const WARNING_TITLES: Record<string, () => string> = {
  screenshot_missing: () => t('Screenshot unavailable'),
  screenshot_not_found: () => t('Screenshot not found'),
  screenshot_empty: () => t('Screenshot empty'),
  screenshot_error: () => t('Screenshot error'),
  agent_failed: () => t('Agent returned an error'),
  agent_error: () => t('Agent failed'),
  brain_failed: () => t('Brain synthesis incomplete'),
  brain_error: () => t('Brain synthesis failed'),
  annotations_error: () => t('Annotations unavailable'),
}

function warningTitle(type: string): string {
  return WARNING_TITLES[type]?.() ?? t('Warning')
}
</script>
