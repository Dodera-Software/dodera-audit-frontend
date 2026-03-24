<template>
  <ClientOnly>
    <div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Dashboard') }}</h1>
          <p class="mt-1 text-(--ui-text-muted)">{{ t('Your projects overview') }}</p>
        </div>
        <UButton icon="i-lucide-plus" to="/projects/new">
          {{ t('New project') }}
        </UButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="mt-8 flex justify-center py-16">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
      </div>

      <!-- Empty state -->
      <div v-else-if="projects.length === 0" class="mt-8">
        <UCard class="text-center py-12">
          <UIcon name="i-lucide-globe" class="mx-auto h-12 w-12 text-(--ui-text-muted)" />
          <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No projects yet') }}</h3>
          <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Create your first project to start auditing.') }}</p>
          <UButton class="mt-6" icon="i-lucide-plus" to="/projects/new">
            {{ t('Create your first project') }}
          </UButton>
        </UCard>
      </div>

      <!-- Project grid -->
      <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="project in projects"
          :key="project.id"
          class="cursor-pointer transition-shadow hover:shadow-lg"
          @click="navigateTo(`/projects/${project.id}`)"
        >
          <div class="flex items-start gap-3">
            <img
              :src="`https://www.google.com/s2/favicons?domain=${encodeURIComponent(project.url)}&sz=32`"
              :alt="project.name"
              class="h-8 w-8 rounded"
              loading="lazy"
            >
            <div class="min-w-0 flex-1">
              <h3 class="truncate font-semibold text-(--ui-text-highlighted)">{{ project.name }}</h3>
              <p class="truncate text-sm text-(--ui-text-muted)">{{ project.url }}</p>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <UBadge size="sm" color="neutral" variant="subtle">{{ siteTypeLabel(project.site_type) }}</UBadge>

            <div v-if="project.latest_score !== null && project.latest_score !== undefined" class="text-right">
              <span class="text-2xl font-bold" :class="scoreColor(project.latest_score)">
                {{ project.latest_score }}
              </span>
              <span class="text-xs text-(--ui-text-muted)">/100</span>
            </div>
            <span v-else class="text-sm text-(--ui-text-muted)">{{ t('Not audited yet') }}</span>
          </div>

          <div v-if="project.latest_audit_date" class="mt-2 text-xs text-(--ui-text-muted)">
            {{ t('Last audit') }}: {{ formatDate(project.latest_audit_date) }}
          </div>
        </UCard>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { scoreColor } from '~/constants/audit'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const { siteTypeLabel } = useProjectOptions()

interface ProjectItem {
  id: string
  name: string
  url: string
  site_type: string
  latest_score: number | null
  latest_audit_date: string | null
  audits_count: number
}

const projects = ref<ProjectItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $api<{ data: ProjectItem[] }>('/projects')
    projects.value = data.data
  }
  catch (e) {
    apiError.parse(e, t('Failed to load projects.'))
  }
  finally {
    loading.value = false
  }
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}
</script>
