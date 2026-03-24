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
            <p class="text-sm text-(--ui-text-muted)">{{ project.url }}</p>
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

      <!-- Latest audit summary (when not scanning) -->
      <div v-else-if="project.audits_count > 0" class="mt-8">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-(--ui-text-muted)">{{ t('Latest audit') }}</p>
              <div v-if="project.latest_score !== null">
                <span class="text-4xl font-bold" :class="scoreColor(project.latest_score)">
                  {{ project.latest_score }}
                </span>
                <span class="text-(--ui-text-muted)">/100</span>
              </div>
              <span v-else class="text-sm text-(--ui-text-muted)">{{ t('Score pending') }}</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right text-sm text-(--ui-text-muted)">
                <div>{{ project.audits_count }} {{ t('audits') }}</div>
                <div v-if="project.latest_audit_date">{{ formatDate(project.latest_audit_date) }}</div>
              </div>
              <UButton
                v-if="project.latest_audit_id"
                icon="i-lucide-arrow-right"
                variant="soft"
                :to="`/projects/${projectId}/audits/${project.latest_audit_id}`"
              >
                {{ t('View report') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- No audits yet -->
      <div v-else class="mt-8">
        <UCard class="py-12 text-center">
          <UIcon name="i-lucide-scan" class="mx-auto h-12 w-12 text-(--ui-text-muted)" />
          <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No audits yet') }}</h3>
          <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Run your first audit to see results.') }}</p>
          <UButton class="mt-6" icon="i-lucide-scan" :loading="triggeringAudit" @click="triggerAudit">
            {{ t('Run first audit') }}
          </UButton>
        </UCard>
      </div>
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
const { formatDate } = useFormatters()

const projectId = route.params.id as string
const auditId = ref<string | null>(null)

interface ProjectDetail {
  id: string
  name: string
  url: string
  site_type: string
  latest_audit_id: string | null
  latest_score: number | null
  latest_audit_date: string | null
  audits_count: number
}

const project = ref<ProjectDetail | null>(null)
const loading = ref(true)
const triggeringAudit = ref(false)

const scanProgress = useScanProgress(auditId)

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
