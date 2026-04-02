<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Move to project') }}</h2>
        <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('Choose which project this page belongs to.') }}</p>

        <div class="mt-5 space-y-4">
          <USelect
            v-model="selectedProjectId"
            :items="projectOptions"
            class="w-full"
          />

          <!-- Inline create project -->
          <div class="flex items-center gap-2">
            <UButton
              v-if="!showNewProjectInput"
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-plus"
              @click="showNewProjectInput = true"
            >
              {{ t('Create project') }}
            </UButton>
            <template v-else>
              <UInput
                v-model="newProjectName"
                :placeholder="t('New project name')"
                class="flex-1"
                size="sm"
                @keyup.enter="handleCreateProject"
              />
              <UButton
                size="sm"
                :loading="creatingProject"
                :disabled="!newProjectName.trim()"
                @click="handleCreateProject"
              >
                {{ t('Create') }}
              </UButton>
            </template>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="outline" @click="open = false">
              {{ t('Cancel') }}
            </UButton>
            <UButton
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
