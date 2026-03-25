<template>
  <ClientOnly>
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else-if="project">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img
            :src="`https://www.google.com/s2/favicons?domain=${encodeURIComponent(project.url)}&sz=32`"
            :alt="project.name"
            class="h-8 w-8 rounded"
          >
          <div>
            <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ project.name }}</h1>
            <div class="flex items-center gap-2">
              <a :href="project.url" target="_blank" class="text-sm text-(--ui-text-muted) hover:underline">
                {{ project.url }}
              </a>
              <UBadge variant="subtle" color="neutral" size="xs">{{ siteTypeLabel }}</UBadge>
            </div>
          </div>
        </div>
        <UButton
          icon="i-lucide-scan"
          :loading="triggeringAudit"
          :disabled="scanProgress.state.status === 'scanning'"
          @click="triggerAudit"
        >
          {{ t('Run audit') }}
        </UButton>
      </div>

      <!-- Scan progress -->
      <ScanProgress
        v-if="scanProgress.state.status === 'scanning' || scanProgress.state.status === 'failed'"
        :state="scanProgress.state"
        @retry="triggerAudit"
      />

      <!-- Content when not scanning -->
      <template v-else>
        <!-- Stats row -->
        <div v-if="project.audits_count > 0" class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <!-- Score -->
          <UCard class="text-center">
            <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Latest score') }}</p>
            <div v-if="project.latest_score != null" class="mt-1">
              <span class="text-3xl font-bold" :class="scoreColor(project.latest_score)">
                {{ project.latest_score }}
              </span>
              <span class="text-sm text-(--ui-text-muted)">/100</span>
            </div>
            <span v-else class="mt-1 block text-sm text-(--ui-text-muted)">{{ t('Pending') }}</span>
          </UCard>

          <!-- Audits count -->
          <UCard class="text-center">
            <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Total audits') }}</p>
            <p class="mt-1 text-3xl font-bold text-(--ui-text-highlighted)">{{ project.audits_count }}</p>
          </UCard>

          <!-- Last audit date -->
          <UCard class="text-center">
            <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Last audited') }}</p>
            <p v-if="project.latest_audit_date" class="mt-1 text-sm font-medium text-(--ui-text-highlighted)">
              {{ formatRelativeDate(project.latest_audit_date) }}
            </p>
            <span v-else class="mt-1 block text-sm text-(--ui-text-muted)">—</span>
          </UCard>

          <!-- Conversion goal -->
          <UCard class="text-center">
            <p class="text-xs font-medium text-(--ui-text-muted)">{{ t('Conversion goal') }}</p>
            <p class="mt-1 text-sm font-medium text-(--ui-text-highlighted)">{{ project.conversion_goal }}</p>
          </UCard>
        </div>

        <!-- Quick actions -->
        <div v-if="project.audits_count > 0" class="mt-6 flex gap-3">
          <UButton
            v-if="project.latest_audit_id"
            icon="i-lucide-file-text"
            variant="soft"
            :to="`/projects/${projectId}/audits/${project.latest_audit_id}`"
          >
            {{ t('View latest report') }}
          </UButton>
          <UButton
            icon="i-lucide-history"
            variant="outline"
            :to="`/projects/${projectId}/history`"
          >
            {{ t('Audit history') }}
          </UButton>
          <UButton
            icon="i-lucide-kanban"
            variant="outline"
            :to="`/projects/${projectId}/board`"
          >
            {{ t('Issue board') }}
          </UButton>
        </div>

        <!-- Brain feed -->
        <div v-if="project.audits_count > 0" class="mt-8">
          <h2 class="mb-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Project Brain') }}</h2>
          <BrainFeed :project-id="projectId" />
        </div>

        <!-- No audits yet -->
        <div v-if="project.audits_count === 0" class="mt-8">
          <UCard class="py-12 text-center">
            <UIcon name="i-lucide-scan" class="mx-auto h-12 w-12 text-(--ui-text-muted)" />
            <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No audits yet') }}</h3>
            <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Run your first audit to see results.') }}</p>
            <UButton class="mt-6" icon="i-lucide-scan" :loading="triggeringAudit" @click="triggerAudit">
              {{ t('Run first audit') }}
            </UButton>
          </UCard>
        </div>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { scoreColor } from '~/constants/audit'
import ScanProgress from '~/components/audit/ScanProgress.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { formatRelativeDate } = useFormatters()

const projectId = route.params.id as string
const auditId = ref<string | null>(null)

interface ProjectDetail {
  id: string
  name: string
  url: string
  site_type: string
  conversion_goal: string
  latest_audit_id: string | null
  latest_score: number | null
  latest_audit_date: string | null
  audits_count: number
}

const project = ref<ProjectDetail | null>(null)
const loading = ref(true)
const triggeringAudit = ref(false)

const scanProgress = useScanProgress(auditId)

const siteTypeLabel = computed(() => {
  const labels: Record<string, () => string> = {
    saas: () => t('SaaS'),
    ecommerce: () => t('E-commerce'),
    agency: () => t('Agency'),
    lead_gen: () => t('Lead Gen'),
    local: () => t('Local Business'),
    blog: () => t('Blog'),
    webapp: () => t('Web App'),
    other: () => t('Other'),
  }
  return labels[project.value?.site_type ?? '']?.() ?? project.value?.site_type ?? ''
})

onMounted(async () => {
  await loadProject()
})

async function loadProject() {
  try {
    const data = await $api<{ data: ProjectDetail }>(`/projects/${projectId}`)
    project.value = data.data
  }
  catch (e) {
    apiError.parse(e, t('Failed to load project.'))
  }
  finally {
    loading.value = false
  }
}

async function triggerAudit() {
  triggeringAudit.value = true
  apiError.clear()

  try {
    const data = await $api<{ data: { id: string } }>(`/projects/${projectId}/audits`, { method: 'POST' })
    auditId.value = data.data.id
    scanProgress.start()
  }
  catch (e) {
    apiError.parse(e, t('Failed to start audit.'))
  }
  finally {
    triggeringAudit.value = false
  }
}

watch(() => scanProgress.state.status, async (status) => {
  if (status !== 'complete') return
  await loadProject()
  if (auditId.value) {
    navigateTo(`/projects/${projectId}/audits/${auditId.value}`)
  }
})
</script>
