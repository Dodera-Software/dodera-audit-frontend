<template>
  <ClientOnly>
    <div>
      <!-- Welcome header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-(--ui-text-highlighted)">
            {{ t('Welcome back, {name}', { name: authStore.user?.name?.split(' ')[0] ?? '' }) }}
          </h1>
          <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ t("Here's what's happening with your audits.") }}</p>
        </div>
        <UButton icon="i-lucide-plus" @click="showAddPageDialog = true">
          {{ t('Add page') }}
        </UButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="mt-6 flex justify-center py-16">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
      </div>

      <template v-else>
        <!-- Stats row -->
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UCard v-for="stat in statCards" :key="stat.label">
            <div class="flex items-start gap-3">
              <UIcon :name="stat.icon" class="mt-0.5 h-5 w-5 shrink-0 text-(--ui-text-muted)" />
              <div>
                <p class="text-xs font-medium text-(--ui-text-muted)">{{ stat.label }}</p>
                <p class="mt-0.5 text-2xl font-bold text-(--ui-text-highlighted)">{{ stat.value }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Recent pages -->
        <div class="mt-8">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Recent pages') }}</h2>
            <UButton v-if="pages.length > 0" variant="ghost" size="sm" to="/projects" trailing-icon="i-lucide-arrow-right">
              {{ t('View all') }}
            </UButton>
          </div>

          <!-- Empty -->
          <div v-if="pages.length === 0" class="mt-4 rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
            <Vue3Lottie animation-link="/animations/animation-bot.json" :height="120" :width="120" :loop="true" :auto-play="true" class="mx-auto" />
            <h3 class="mt-3 font-semibold text-(--ui-text-highlighted)">{{ t('No pages to audit yet') }}</h3>
            <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('Add a page URL to get a detailed AI-powered audit.') }}</p>
            <UButton class="mt-4" icon="i-lucide-plus" size="sm" @click="showAddPageDialog = true">
              {{ t('Audit your first page') }}
            </UButton>
          </div>

          <!-- Page cards with thumbnails -->
          <div v-else class="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="page in recentPages"
              :key="page.id"
              class="group cursor-pointer overflow-hidden rounded-xl border border-(--ui-border) bg-(--ui-bg) transition-all hover:shadow-lg"
              @click="navigateTo(`/projects/${page.project_id}/pages/${page.id}`)"
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
                    <UPopover :ui="{ content: 'w-44' }">
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
                            icon="i-lucide-folder-open"
                            variant="ghost"
                            color="neutral"
                            size="sm"
                            block
                            class="justify-start"
                            @click="navigateTo(`/projects/${page.project_id}`)"
                          >
                            {{ t('Show in project') }}
                          </UButton>
                          <UButton
                            icon="i-lucide-folder-input"
                            variant="ghost"
                            color="neutral"
                            size="sm"
                            block
                            class="justify-start"
                            @click="openMovePage(page)"
                          >
                            {{ t('Move to project') }}
                          </UButton>
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
                  <UBadge v-if="page.project_name" size="xs" color="neutral" variant="subtle" class="flex items-center gap-1">
                    <UIcon name="i-lucide-folder" class="h-2.5 w-2.5" />
                    {{ page.project_name }}
                  </UBadge>
                  <UBadge v-if="page.site_type" size="xs" color="neutral" variant="subtle">{{ siteTypeLabel(page.site_type) }}</UBadge>
                  <span v-if="page.latest_audit_date" class="flex items-center gap-1">
                    <UIcon name="i-lucide-clock" class="h-3 w-3" />
                    {{ formatRelativeDate(page.latest_audit_date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <CreatePageDialog
        v-model:open="showAddPageDialog"
        @created="onPageCreated"
      />

      <MovePageDialog
        v-if="movePageTarget"
        v-model:open="showMovePageDialog"
        :page-id="movePageTarget.id"
        :page-project-id="movePageTarget.project_id"
        @moved="onPageMoved"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { $api } = useApi()
const authStore = useAuthStore()
const { siteTypeLabel } = useProjectOptions()
const { formatRelativeDate } = useFormatters()
const { confirm } = useConfirm()

const showAddPageDialog = ref(false)
const showMovePageDialog = ref(false)
const movePageTarget = ref<PageItem | null>(null)

interface PageItem {
  id: string
  project_id: string
  project_name: string | null
  name: string | null
  url: string
  site_type: string
  latest_score: number | null
  latest_audit_date: string | null
  audits_count: number
}

interface UserStats {
  plan: string
  projects_count: number
  pages_count: number
  audits_this_month: number
}

const pages = ref<PageItem[]>([])
const stats = ref<UserStats | null>(null)
const loading = ref(true)

const recentPages = computed(() => pages.value.slice(0, 6))

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

const planLabel = computed(() => {
  const p = authStore.user?.plan ?? stats.value?.plan ?? 'free'
  return p.charAt(0).toUpperCase() + p.slice(1)
})

const statCards = computed(() => {
  const s = stats.value
  return [
    { label: t('Projects'), value: s?.projects_count ?? 0, icon: 'i-lucide-folder' },
    { label: t('Pages'), value: s?.pages_count ?? 0, icon: 'i-lucide-file-text' },
    { label: t('Audits this month'), value: s?.audits_this_month ?? 0, icon: 'i-lucide-scan' },
    { label: t('Plan'), value: planLabel.value, icon: 'i-lucide-crown' },
  ]
})

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
    pages.value = pages.value.filter(p => p.id !== page.id)
  }
  catch {
    // best-effort
  }
}

function onPageCreated(page: { id: string, project_id: string }) {
  navigateTo(`/projects/${page.project_id}/pages/${page.id}`)
}

function openMovePage(page: PageItem) {
  movePageTarget.value = page
  showMovePageDialog.value = true
}

function onPageMoved(projectId: string, projectName: string) {
  if (movePageTarget.value) {
    const idx = pages.value.findIndex(p => p.id === movePageTarget.value!.id)
    if (idx !== -1) {
      pages.value[idx] = { ...pages.value[idx], project_id: projectId, project_name: projectName } as PageItem
    }
  }
}

onMounted(async () => {
  try {
    const [pagesData, statsData] = await Promise.all([
      $api<{ data: PageItem[] }>('/pages'),
      $api<UserStats>('/user/stats'),
    ])
    pages.value = pagesData.data
    stats.value = statsData
  }
  catch {
    // Dashboard is best-effort
  }
  finally {
    loading.value = false
  }
})
</script>
