<template>
  <ClientOnly>
    <!-- Skeleton loading -->
    <div v-if="loading">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <USkeleton class="h-10 w-10 shrink-0 rounded-lg" />
          <div class="space-y-1.5">
            <USkeleton class="h-5 w-40" />
            <USkeleton class="h-3.5 w-20" />
          </div>
        </div>
        <USkeleton class="h-9 w-24 rounded-lg" />
      </div>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <UiSkeletonPageCard v-for="i in 6" :key="i" />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="!project && apiError.hasErrors.value" class="flex flex-col items-center justify-center py-16 text-center">
      <UIcon name="i-lucide-alert-circle" class="h-10 w-10 text-(--ui-text-dimmed)" />
      <h2 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Could not load project') }}</h2>
      <p class="mt-1 text-sm text-(--ui-text-muted)">{{ apiError.displayMessage.value }}</p>
      <UButton class="mt-4" variant="outline" size="sm" to="/projects">{{ t('Back to projects') }}</UButton>
    </div>

    <div v-else-if="project">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-(--ui-primary)/10">
            <UIcon name="i-lucide-folder-open" class="h-5 w-5 text-(--ui-primary)" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ project.name }}</h1>
            <p class="text-sm text-(--ui-text-muted)">
              {{ project.pages_count }} {{ project.pages_count === 1 ? t('page') : t('pages') }}
            </p>
          </div>
        </div>
        <UButton icon="i-lucide-plus" @click="showAddPageDialog = true">
          {{ t('Add page') }}
        </UButton>
      </div>

      <!-- Empty state -->
      <div v-if="project.pages.length === 0" class="mt-8 rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
        <Vue3Lottie animation-link="/animations/animation-bot.json" :height="140" :width="140" :loop="true" :auto-play="true" class="mx-auto" />
        <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No pages yet') }}</h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Add a page URL to start auditing. Each page tracks its own audit history and issues.') }}</p>
        <UButton class="mt-6" icon="i-lucide-plus" @click="showAddPageDialog = true">
          {{ t('Add your first page') }}
        </UButton>
      </div>

      <!-- Pages list -->
      <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="page in project.pages"
          :key="page.id"
          class="group cursor-pointer overflow-hidden rounded-xl border border-(--ui-border) bg-(--ui-bg) transition-all hover:shadow-lg"
          @click="navigateTo(`/projects/${projectId}/pages/${page.id}`)"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-[16/9] overflow-hidden bg-(--ui-bg-accented)">
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <UIcon name="i-lucide-globe" class="h-8 w-8 text-(--ui-text-dimmed)" />
              <span class="text-xs text-(--ui-text-dimmed)">{{ hostname(page.url) }}</span>
            </div>
            <img
              :src="thumbnailUrl(page.url)"
              :alt="page.name || page.url"
              class="relative h-full w-full object-cover object-top opacity-0 transition-all duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              @load="($event.target as HTMLImageElement).classList.replace('opacity-0', 'opacity-100')"
              @error="($event.target as HTMLImageElement).remove()"
            >
            <!-- Score overlay -->
            <div
              v-if="page.latest_score != null"
              class="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-(--ui-bg)/90 backdrop-blur-sm"
              :class="scoreCircleClass(page.latest_score)"
            >
              <span class="text-sm font-bold">{{ page.latest_score }}</span>
            </div>
            <UBadge
              v-if="page.latest_score == null && page.audits_count === 0"
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
                :src="faviconUrl(page.url)"
                :alt="page.name || page.url"
                class="mt-0.5 h-5 w-5 rounded"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-semibold text-(--ui-text-highlighted) group-hover:text-(--ui-primary)">
                  {{ page.name || hostname(page.url) }}
                </h3>
                <p class="truncate text-xs text-(--ui-text-dimmed)">{{ page.url }}</p>
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
                        @click="deletePage(page)"
                      >
                        {{ t('Delete') }}
                      </UButton>
                    </div>
                  </template>
                </UPopover>
              </div>
            </div>

            <div class="mt-3 flex items-center gap-3 text-[11px] text-(--ui-text-dimmed)">
              <UBadge v-if="page.site_type" size="xs" color="neutral" variant="subtle">{{ siteTypeLabel(page.site_type) }}</UBadge>
              <span v-if="page.latest_audit_date" class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="h-3 w-3" />
                {{ formatRelativeDate(page.latest_audit_date) }}
              </span>
              <span v-if="page.audits_count" class="flex items-center gap-1">
                {{ page.audits_count }} {{ page.audits_count === 1 ? 'audit' : 'audits' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CreatePageDialog
        v-model:open="showAddPageDialog"
        :project-id="projectId"
        @created="onPageCreated"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()
const apiError = useApiError()
const { siteTypeLabel } = useProjectOptions()
const { formatRelativeDate } = useFormatters()
const { confirm } = useConfirm()

const projectId = route.params.id as string
const showAddPageDialog = ref(false)

interface PageItem {
  id: string
  name: string | null
  url: string
  site_type: string
  latest_score: number | null
  latest_audit_date: string | null
  audits_count: number
}

interface ProjectDetail {
  id: string
  name: string
  pages_count: number
  pages: PageItem[]
  created_at: string
}

const project = ref<ProjectDetail | null>(null)
const loading = ref(true)

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

async function deletePage(page: PageItem) {
  const confirmed = await confirm({
    title: t('Delete this page?'),
    description: t('This will permanently remove this page and all its audit history. This action cannot be undone.'),
    confirmLabel: t('Delete'),
    color: 'error',
    icon: 'i-lucide-trash-2',
  })
  if (!confirmed) return

  try {
    await $api(`/pages/${page.id}`, { method: 'DELETE' })
    if (project.value) {
      project.value.pages = project.value.pages.filter(p => p.id !== page.id)
      project.value.pages_count -= 1
    }
  }
  catch (e) {
    apiError.parse(e, t('Failed to delete page.'))
  }
}

function onPageCreated(page: { id: string }) {
  navigateTo(`/projects/${projectId}/pages/${page.id}`)
}

onMounted(async () => {
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
})
</script>
