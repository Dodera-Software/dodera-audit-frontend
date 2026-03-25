<template>
  <ClientOnly>
    <div>
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ t('Projects') }}</h1>
        <UButton icon="i-lucide-plus" @click="showCreateDialog = true">
          {{ t('New page audit') }}
        </UButton>
      </div>

      <!-- Search -->
      <div v-if="!loading && projects.length > 0" class="mt-4">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('Search projects...')"
          size="sm"
          class="max-w-xs"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="mt-6 flex justify-center py-16">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
      </div>

      <!-- Empty state -->
      <div v-else-if="projects.length === 0" class="mt-6 rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
        <Vue3Lottie animation-link="/animations/animation-bot.json" :height="140" :width="140" :loop="true" :auto-play="true" class="mx-auto" />
        <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No pages to audit yet') }}</h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Add a page URL to get a detailed AI-powered audit.') }}</p>
        <UButton class="mt-6" icon="i-lucide-plus" @click="showCreateDialog = true">
          {{ t('Audit your first page') }}
        </UButton>
      </div>

      <!-- No search results -->
      <div v-else-if="filteredProjects.length === 0" class="mt-6 rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
        <UIcon name="i-lucide-search-x" class="mx-auto h-12 w-12 text-(--ui-text-muted)" />
        <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No pages found') }}</h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Try a different search term.') }}</p>
      </div>

      <!-- Project grid with thumbnails -->
      <div v-else class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="group cursor-pointer overflow-hidden rounded-xl border border-(--ui-border) bg-(--ui-bg) transition-all hover:shadow-lg"
          @click="navigateTo(`/projects/${project.id}`)"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-[16/9] overflow-hidden bg-(--ui-bg-accented)">
            <!-- Fallback -->
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <UIcon name="i-lucide-globe" class="h-8 w-8 text-(--ui-text-dimmed)" />
              <span class="text-xs text-(--ui-text-dimmed)">{{ hostname(project.url) }}</span>
            </div>
            <!-- Thumbnail: hidden until loaded -->
            <img
              :src="thumbnailUrl(project.url)"
              :alt="project.name"
              class="relative h-full w-full object-cover object-top opacity-0 transition-all duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              @load="($event.target as HTMLImageElement).classList.replace('opacity-0', 'opacity-100')"
              @error="($event.target as HTMLImageElement).remove()"
            >
            <!-- Score overlay -->
            <div
              v-if="project.latest_score != null"
              class="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-(--ui-bg)/90 backdrop-blur-sm"
              :class="scoreCircleClass(project.latest_score)"
            >
              <span class="text-sm font-bold">{{ project.latest_score }}</span>
            </div>
            <UBadge
              v-if="project.latest_score == null && project.audits_count === 0"
              class="absolute left-3 top-3"
              color="neutral"
              variant="solid"
              size="xs"
            >
              {{ t('Not audited yet') }}
            </UBadge>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="flex items-start gap-2.5">
              <img
                :src="faviconUrl(project.url)"
                :alt="project.name"
                class="mt-0.5 h-5 w-5 rounded"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-semibold text-(--ui-text-highlighted) group-hover:text-(--ui-primary)">
                  {{ project.name }}
                </h3>
                <p class="truncate text-xs text-(--ui-text-dimmed)">{{ project.url }}</p>
              </div>
              <div @click.stop>
                <UPopover :ui="{ content: 'w-40' }">
                  <UButton
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-ellipsis-vertical"
                    size="xs"
                    class="shrink-0"
                  />
                  <template #content>
                    <div class="p-1">
                      <UButton
                        icon="i-lucide-trash-2"
                        variant="ghost"
                        color="error"
                        size="sm"
                        block
                        class="justify-start"
                        @click="deleteProject(project)"
                      >
                        {{ t('Delete') }}
                      </UButton>
                    </div>
                  </template>
                </UPopover>
              </div>
            </div>

            <div class="mt-3 flex items-center gap-3 text-[11px] text-(--ui-text-dimmed)">
              <UBadge size="xs" color="neutral" variant="subtle">{{ siteTypeLabel(project.site_type) }}</UBadge>
              <span v-if="project.latest_audit_date" class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="h-3 w-3" />
                {{ formatRelativeDate(project.latest_audit_date) }}
              </span>
              <span v-if="project.audits_count" class="flex items-center gap-1">
                {{ project.audits_count }} {{ project.audits_count === 1 ? 'audit' : 'audits' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <CreateProjectDialog v-model:open="showCreateDialog" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

definePageMeta({ middleware: 'auth' })

const showCreateDialog = ref(false)
const { confirm } = useConfirm()

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const { siteTypeLabel } = useProjectOptions()
const { formatRelativeDate } = useFormatters()

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
const search = ref('')

const filteredProjects = computed(() => {
  const query = search.value.toLowerCase().trim()
  if (!query) return projects.value
  return projects.value.filter(p =>
    p.name.toLowerCase().includes(query) || p.url.toLowerCase().includes(query),
  )
})

function thumbnailUrl(url: string): string {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=640&h=360`
}

function faviconUrl(url: string): string {
  return `https://www.google.com/s2/favicons?domain=${hostname(url)}&sz=32`
}

function hostname(url: string): string {
  try { return new URL(url).hostname }
  catch { return url }
}

function scoreCircleClass(score: number): string {
  if (score >= 80) return 'border-green-500 text-green-500'
  if (score >= 50) return 'border-yellow-500 text-yellow-500'
  return 'border-red-500 text-red-500'
}

async function deleteProject(project: ProjectItem) {
  const confirmed = await confirm({
    title: t('Delete this project?'),
    description: t('This will permanently remove this project and all its audit history. This action cannot be undone.'),
    confirmLabel: t('Delete'),
    color: 'error',
    icon: 'i-lucide-trash-2',
  })
  if (!confirmed) return

  try {
    await $api(`/projects/${project.id}`, { method: 'DELETE' })
    projects.value = projects.value.filter(p => p.id !== project.id)
  }
  catch (e) {
    apiError.parse(e, t('Failed to delete project.'))
  }
}

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
</script>
