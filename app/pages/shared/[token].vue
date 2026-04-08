<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-primary)" />
        <p class="text-sm text-(--ui-text-muted)">{{ t('Loading report...') }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-32 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <UIcon name="i-lucide-link-2-off" class="h-10 w-10 text-red-400" />
      </div>
      <h1 class="mt-6 text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Report unavailable') }}</h1>
      <p class="mt-2 max-w-md text-(--ui-text-muted)">
        {{ t('This shared report has expired or the link is no longer valid. Ask the report owner to generate a new link.') }}
      </p>
      <div class="mt-8 flex gap-3">
        <UButton to="/register" size="lg" icon="i-lucide-sparkles">
          {{ t('Try PawByTech free') }}
        </UButton>
      </div>
    </div>

    <!-- Report -->
    <template v-else-if="report">
      <!-- Hero banner with gradient -->
      <div class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-(--ui-primary)/5 via-(--ui-primary)/3 to-transparent" />
        <div class="relative mx-auto max-w-7xl px-6 pb-10 pt-12 text-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-(--ui-border) bg-(--ui-bg)/80 px-3 py-1 text-xs text-(--ui-text-dimmed) backdrop-blur">
            <UIcon name="i-lucide-user" class="h-3 w-3" />
            {{ t('Shared by {name}', { name: report.shared_by }) }}
            <span class="text-(--ui-border)">|</span>
            <UIcon name="i-lucide-calendar" class="h-3 w-3" />
            {{ formatDate(report.audit.created_at) }}
          </div>
          <h1 class="mt-4 text-3xl font-bold tracking-tight text-(--ui-text-highlighted) sm:text-4xl">
            {{ report.page.name || t('Website Audit Report') }}
          </h1>
          <p class="mt-2 text-(--ui-text-muted)">{{ report.page.url }}</p>
          <UBadge color="neutral" variant="subtle" size="sm" class="mt-3">{{ report.page.site_type }}</UBadge>
        </div>
      </div>

      <div class="mx-auto max-w-7xl px-6">
        <!-- Score Dashboard -->
        <section class="-mt-2">
          <AuditScoreDashboard
            :overall-score="report.audit.overall_score ?? 0"
            :scores="report.audit.scores ?? {}"
            :score-details="report.audit.score_details"
            :delta="report.delta"
            :score-history="[]"
          />
        </section>

        <!-- Two-column: Issues + Performance -->
        <div class="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <!-- Issues (wider) -->
          <section v-if="report.top_issues?.length" class="lg:col-span-3">
            <div class="mb-5 flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <UIcon name="i-lucide-alert-triangle" class="h-4 w-4 text-red-500" />
              </div>
              <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Top Issues Found') }}</h2>
            </div>
            <div class="space-y-3">
              <div
                v-for="(issue, idx) in report.top_issues"
                :key="issue.id"
                class="group rounded-xl border border-(--ui-border) bg-(--ui-bg) p-4 transition-shadow hover:shadow-md"
              >
                <div class="flex items-start gap-3">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--ui-bg-elevated) text-xs font-semibold text-(--ui-text-dimmed)">
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-(--ui-text-highlighted)">{{ issue.title }}</p>
                      <UBadge
                        :color="SEVERITY_BADGE_COLORS[issue.severity] ?? 'neutral'"
                        variant="subtle"
                        size="xs"
                      >
                        {{ issue.severity }}
                      </UBadge>
                    </div>
                    <p v-if="issue.description" class="mt-1 text-sm leading-relaxed text-(--ui-text-muted)">{{ issue.description }}</p>
                    <div v-if="issue.ai_suggestion" class="mt-3 flex gap-2 rounded-lg bg-(--ui-primary)/5 px-3 py-2.5">
                      <UIcon name="i-lucide-lightbulb" class="mt-0.5 h-4 w-4 shrink-0 text-(--ui-primary)" />
                      <p class="text-sm text-(--ui-text-muted)">{{ issue.ai_suggestion }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Performance sidebar -->
          <section v-if="report.audit.performance_breakdown" class="lg:col-span-2">
            <AuditPerformanceBreakdown :breakdown="report.audit.performance_breakdown" />
          </section>
        </div>

        <!-- Persona cards -->
        <section v-if="personas.length" class="mt-14">
          <div class="mb-5 flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-(--ui-primary)/10">
              <UIcon name="i-lucide-users" class="h-4 w-4 text-(--ui-primary)" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Visitor Perspectives') }}</h2>
              <p class="text-xs text-(--ui-text-dimmed)">{{ t('How different visitor types experience this page') }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AuditPersonaCard
              v-for="persona in personas"
              :key="persona.persona"
              :persona="persona"
              :is-lowest-intent="persona.persona === lowestIntentPersona"
            />
          </div>
        </section>

        <!-- Mid-page CTA -->
        <section class="mt-14">
          <div class="rounded-2xl border border-(--ui-primary)/20 bg-gradient-to-r from-(--ui-primary)/5 to-(--ui-primary)/10 p-8 text-center">
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Get your own AI-powered audit') }}</h3>
            <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('Analyze any website in minutes. Free to start.') }}</p>
            <UButton to="/register" class="mt-4" icon="i-lucide-arrow-right" trailing>
              {{ t('Create free account') }}
            </UButton>
          </div>
        </section>

        <!-- Expiry notice -->
        <div class="mb-8 mt-10 text-center text-xs text-(--ui-text-dimmed)">
          <UIcon name="i-lucide-clock" class="mr-1 inline h-3 w-3" />
          {{ t('This shared report expires on {date}', { date: formatDate(report.expires_at) }) }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { SEVERITY_BADGE_COLORS } from '~/constants/severity'

definePageMeta({ layout: 'shared' as any })

const route = useRoute()
const { t } = useI18n()
const { $api } = useApi()
const { formatDate } = useFormatters()

const token = route.params.token as string
const loading = ref(true)
const error = ref(false)
const report = ref<any>(null)

const personas = computed(() => {
  if (!report.value?.audit?.persona_outputs) return []
  return report.value.audit.persona_outputs
    .map((p: any) => p.output)
    .filter(Boolean)
})

const lowestIntentPersona = computed(() => {
  if (!personas.value.length) return null
  return personas.value.reduce((lowest: any, p: any) =>
    (p.scores?.action_intent ?? 100) < (lowest.scores?.action_intent ?? 100) ? p : lowest,
  ).persona
})

onMounted(async () => {
  try {
    report.value = await $api<any>(`/shared/${token}`)
  }
  catch {
    error.value = true
  }
  finally {
    loading.value = false
  }
})

useHead({
  title: computed(() =>
    report.value
      ? `${report.value.page.name || report.value.page.url} - ${t('Audit Report')} | PawByTech`
      : `${t('Shared Report')} | PawByTech`,
  ),
})
</script>
