<template>
  <ClientOnly>
    <UiPageShell>
      <Teleport to="#navbar-actions">
        <UButton size="lg" icon="i-lucide-plus" @click="showCreateDialog = true">
          {{ t('New project') }}
        </UButton>
      </Teleport>

      <UiPageHeader
        :title="t('My projects')"
        :subtitle="t('Manage and organise your audit projects.')"
      />

      <!-- Search -->
      <div v-if="!loading && projects.length > 0">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('Search projects...')"
          size="md"
          class="max-w-sm"
        />
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <UiSkeletonProjectCard v-for="i in 6" :key="i" />
      </div>

      <!-- Empty state -->
      <div v-else-if="projects.length === 0" class="rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
        <UiLottie src="/animations/animation-bot.json" class="mx-auto" />
        <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No projects yet') }}</h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Create a project folder to group pages you want to audit.') }}</p>
        <UButton class="mt-6" size="lg" icon="i-lucide-plus" @click="showCreateDialog = true">
          {{ t('Create your first project') }}
        </UButton>
      </div>

      <!-- No search results -->
      <div v-else-if="filteredProjects.length === 0" class="rounded-xl border border-dashed border-(--ui-border) py-16 text-center">
        <UIcon name="i-lucide-search-x" class="mx-auto h-12 w-12 text-(--ui-text-muted)" />
        <h3 class="mt-4 text-lg font-semibold text-(--ui-text-highlighted)">{{ t('No projects found') }}</h3>
        <p class="mt-2 text-sm text-(--ui-text-muted)">{{ t('Try a different search term.') }}</p>
      </div>

      <!-- Project folder grid -->
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="group cursor-pointer overflow-hidden rounded-xl border border-(--ui-border) bg-(--ui-bg) p-5 transition-all hover:shadow-lg"
          @click="navigateTo(`/projects/${project.id}`)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--ui-primary)/10">
                <UIcon name="i-lucide-folder" class="h-5 w-5 text-(--ui-primary)" />
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-(--ui-text-highlighted) group-hover:text-(--ui-primary)">
                  {{ project.name }}
                </h3>
                <p class="text-xs text-(--ui-text-dimmed)">
                  {{ project.pages_count }} {{ project.pages_count === 1 ? t('page') : t('pages') }}
                </p>
              </div>
            </div>
            <div v-if="project.name !== 'Default'" @click.stop>
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
                      icon="i-lucide-pencil"
                      variant="ghost"
                      color="neutral"
                      size="sm"
                      block
                      class="justify-start"
                      @click="openRenameDialog(project)"
                    >
                      {{ t('Rename') }}
                    </UButton>
                    <UButton
                      icon="i-lucide-trash-2"
                      variant="ghost"
                      color="error"
                      size="sm"
                      block
                      class="justify-start"
                      @click="openDeleteDialog(project)"
                    >
                      {{ t('Delete') }}
                    </UButton>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>

          <!-- Pages preview -->
          <div v-if="project.pages && project.pages.length > 0" class="mt-4 space-y-1.5">
            <div
              v-for="page in project.pages.slice(0, 3)"
              :key="page.id"
              class="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-(--ui-text-muted)"
            >
              <img
                :src="`https://www.google.com/s2/favicons?domain=${hostname(page.url)}&sz=16`"
                class="h-3.5 w-3.5 rounded"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
              <span class="truncate">{{ page.name || hostname(page.url) }}</span>
              <span
                v-if="page.latest_score != null"
                class="ml-auto shrink-0 font-semibold"
                :class="scoreColor(page.latest_score)"
              >{{ page.latest_score }}</span>
            </div>
            <p v-if="project.pages_count > 3" class="px-2 text-[11px] text-(--ui-text-dimmed)">
              +{{ project.pages_count - 3 }} {{ t('more') }}
            </p>
          </div>

          <div v-else class="mt-4 rounded-md border border-dashed border-(--ui-border) py-3 text-center">
            <p class="text-xs text-(--ui-text-dimmed)">{{ t('No pages yet') }}</p>
          </div>

          <div class="mt-3 flex items-center justify-between text-[11px] text-(--ui-text-dimmed)">
            <span>{{ formatRelativeDate(project.created_at) }}</span>
            <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      <CreateProjectDialog v-model:open="showCreateDialog" />

      <RenameProjectDialog
        v-if="renameTarget"
        v-model:open="showRenameDialog"
        :project-id="renameTarget.id"
        :project-name="renameTarget.name"
        @renamed="onProjectRenamed"
      />

      <DeleteProjectDialog
        v-if="deleteTarget"
        v-model:open="showDeleteDialog"
        :project-id="deleteTarget.id"
        :project-name="deleteTarget.name"
        :pages-count="deleteTarget.pages_count"
        @deleted="onProjectDeleted"
      />
    </UiPageShell>
  </ClientOnly>
</template>

<script setup lang="ts">
import { scoreColor } from '~/constants/audit'

definePageMeta({ middleware: 'auth' })

const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const deleteTarget = ref<ProjectItem | null>(null)
const showRenameDialog = ref(false)
const renameTarget = ref<ProjectItem | null>(null)

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()
const { formatRelativeDate, hostname } = useFormatters()

onMounted(() => {
  setNavbar({ title: t('Projects') })
})

interface PagePreview {
  id: string
  name: string | null
  url: string
  latest_score: number | null
}

interface ProjectItem {
  id: string
  name: string
  pages_count: number
  pages: PagePreview[]
  created_at: string
}

const projects = ref<ProjectItem[]>([])
const loading = ref(true)
const search = ref('')

const filteredProjects = computed(() => {
  const query = search.value.toLowerCase().trim()
  if (!query) return projects.value
  return projects.value.filter(p => p.name.toLowerCase().includes(query))
})

function openDeleteDialog(project: ProjectItem) {
  deleteTarget.value = project
  showDeleteDialog.value = true
}

function openRenameDialog(project: ProjectItem) {
  renameTarget.value = project
  showRenameDialog.value = true
}

function onProjectRenamed(newName: string) {
  if (!renameTarget.value) {
    return
  }

  const project = projects.value.find(p => p.id === renameTarget.value!.id)
  if (!project) {
    return
  }

  project.name = newName
}

function onProjectDeleted() {
  if (deleteTarget.value) {
    projects.value = projects.value.filter(p => p.id !== deleteTarget.value!.id)
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
