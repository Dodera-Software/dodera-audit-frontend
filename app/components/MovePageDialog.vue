<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--ui-primary)/10">
            <UIcon name="i-lucide-folder-symlink" class="h-4.5 w-4.5 text-(--ui-primary)" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Move to project') }}</h2>
            <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ t('Choose which project this page belongs to.') }}</p>
          </div>
        </div>

        <div class="mt-5 space-y-3">
          <div class="flex gap-2">
            <USelect
              v-model="selectedProjectId"
              :items="projectOptions"
              class="flex-1"
            />
            <UButton
              variant="outline"
              color="neutral"
              :icon="showNewProjectInput ? 'i-lucide-x' : 'i-lucide-plus'"
              :label="showNewProjectInput ? t('Cancel') : t('New')"
              @click="toggleNewProjectInput"
            />
          </div>

          <!-- Inline create project -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="showNewProjectInput" class="rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-3">
              <p class="mb-2 flex items-center gap-1.5 text-xs font-medium text-(--ui-text-muted)">
                <UIcon name="i-lucide-folder-plus" class="h-3.5 w-3.5" />
                {{ t('New project') }}
              </p>
              <div class="flex gap-2">
                <UInput
                  v-model="newProjectName"
                  :placeholder="t('e.g. My Website')"
                  class="flex-1"
                  size="sm"
                  @keyup.enter="handleCreateProject"
                />
                <UButton
                  size="sm"
                  :loading="creatingProject"
                  :disabled="!newProjectName.trim()"
                  icon="i-lucide-check"
                  @click="handleCreateProject"
                >
                  {{ t('Create') }}
                </UButton>
              </div>
            </div>
          </Transition>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="outline" color="neutral" @click="open = false">
              {{ t('Cancel') }}
            </UButton>
            <UButton
              icon="i-lucide-folder-symlink"
              :loading="moving"
              :disabled="!selectedProjectId || selectedProjectId === pageProjectId"
              @click="handleMove"
            >
              {{ t('Move') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageId: string
  pageProjectId: string
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  moved: [projectId: string, projectName: string]
}>()

const { t } = useI18n()
const { $api } = useApi()

const projects = ref<Array<{ id: string, name: string }>>([])
const selectedProjectId = ref('')
const showNewProjectInput = ref(false)
const newProjectName = ref('')
const creatingProject = ref(false)
const moving = ref(false)

const projectOptions = computed(() =>
  projects.value.map(p => ({ label: p.name, value: p.id })),
)

watch(open, async (val) => {
  if (!val) return
  showNewProjectInput.value = false
  newProjectName.value = ''
  selectedProjectId.value = props.pageProjectId

  try {
    const data = await $api<{ data: Array<{ id: string, name: string }> }>('/projects')
    projects.value = data.data
  }
  catch {
    // silent
  }
})

function toggleNewProjectInput() {
  showNewProjectInput.value = !showNewProjectInput.value
  if (!showNewProjectInput.value) newProjectName.value = ''
}

async function handleCreateProject() {
  if (!newProjectName.value.trim()) return
  creatingProject.value = true
  try {
    const data = await $api<{ data: { id: string, name: string } }>('/projects', {
      method: 'POST',
      body: { name: newProjectName.value.trim() },
    })
    projects.value.push(data.data)
    selectedProjectId.value = data.data.id
    showNewProjectInput.value = false
    newProjectName.value = ''
  }
  catch {
    // silent
  }
  finally {
    creatingProject.value = false
  }
}

async function handleMove() {
  if (!selectedProjectId.value || selectedProjectId.value === props.pageProjectId) return
  moving.value = true
  try {
    await $api(`/pages/${props.pageId}`, {
      method: 'PATCH',
      body: { project_id: selectedProjectId.value },
    })
    const project = projects.value.find(p => p.id === selectedProjectId.value)
    open.value = false
    emit('moved', selectedProjectId.value, project?.name ?? '')
  }
  catch {
    // silent
  }
  finally {
    moving.value = false
  }
}
</script>
