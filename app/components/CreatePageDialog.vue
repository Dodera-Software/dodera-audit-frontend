<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <h2 class="text-lg font-bold text-(--ui-text-highlighted)">{{ t('Add a page') }}</h2>
        <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('PawByTech analyzes one page at a time — not your entire website.') }}</p>

        <UForm :schema="schema" :state="form" class="mt-5 space-y-4" @submit="handleCreate">
          <UAlert
            v-if="apiError.hasErrors.value"
            color="error"
            variant="subtle"
            :title="apiError.displayMessage.value"
            icon="i-lucide-alert-circle"
          />

          <UFormField :label="t('Page URL')" name="url">
            <UInput
              v-model="form.url"
              type="url"
              placeholder="https://example.com/landing"
              class="w-full"
              autofocus
            />
          </UFormField>

          <!-- Project picker (shown when no projectId is locked) -->
          <UFormField v-if="showProjectPicker" :label="t('Project')" name="project">
            <div class="flex gap-2">
              <USelect
                v-model="selectedProjectId"
                :items="projectOptions"
                class="flex-1"
              />
              <UButton
                variant="outline"
                color="neutral"
                size="sm"
                icon="i-lucide-plus"
                :title="t('Create project')"
                @click="showNewProjectInput = !showNewProjectInput"
              />
            </div>
            <!-- Inline create project -->
            <div v-if="showNewProjectInput" class="mt-2 flex gap-2">
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
            </div>
          </UFormField>

          <UFormField :label="t('Page name (optional)')" name="name">
            <UInput
              v-model="form.name"
              :placeholder="t('My Landing Page')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Site type')" name="site_type">
            <USelect
              v-model="form.site_type"
              :items="siteTypes"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Primary conversion goal')" name="conversion_goal">
            <USelect
              v-model="form.conversion_goal"
              :items="conversionGoals"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Target audience')" name="target_audience_description">
            <UTextarea
              v-model="form.target_audience_description"
              :placeholder="t('Describe your target audience (optional)')"
              :rows="2"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="outline" @click="open = false">
              {{ t('Cancel') }}
            </UButton>
            <UButton type="submit" :loading="loading" :disabled="!targetProjectId">
              {{ t('Add page') }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { createPageSchema } from '~/schemas/project'

const props = defineProps<{
  projectId?: string
  projects?: Array<{ id: string, name: string }>
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  created: [page: { id: string, project_id: string }]
}>()

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const { siteTypes, conversionGoals } = useProjectOptions()

const schema = createPageSchema(t)

const form = reactive({
  url: '',
  name: '',
  site_type: '',
  conversion_goal: '',
  target_audience_description: '',
})

const loading = ref(false)

// Project picker state
const showProjectPicker = computed(() => !props.projectId)
const fetchedProjects = ref<Array<{ id: string, name: string }>>([])
const selectedProjectId = ref('')
const showNewProjectInput = ref(false)
const newProjectName = ref('')
const creatingProject = ref(false)

const availableProjects = computed(() => props.projects ?? fetchedProjects.value)

const projectOptions = computed(() =>
  availableProjects.value.map(p => ({ label: p.name, value: p.id })),
)

const targetProjectId = computed(() => props.projectId ?? selectedProjectId.value)

function resetForm() {
  form.url = ''
  form.name = ''
  form.site_type = ''
  form.conversion_goal = ''
  form.target_audience_description = ''
  showNewProjectInput.value = false
  newProjectName.value = ''
  apiError.clear()
}

watch(open, async (val) => {
  if (!val) return
  resetForm()

  if (showProjectPicker.value && fetchedProjects.value.length === 0) {
    try {
      const data = await $api<{ data: Array<{ id: string, name: string }> }>('/projects')
      fetchedProjects.value = data.data
      // Auto-select default or first project
      const defaultProject = data.data.find(p => p.name === 'Default') ?? data.data[0]
      if (defaultProject) selectedProjectId.value = defaultProject.id
    }
    catch {
      // silent
    }
  }
  else if (showProjectPicker.value && availableProjects.value.length > 0) {
    const defaultProject = availableProjects.value.find(p => p.name === 'Default') ?? availableProjects.value[0]
    if (defaultProject) selectedProjectId.value = defaultProject.id
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
    fetchedProjects.value.push(data.data)
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

async function handleCreate() {
  if (!targetProjectId.value) return
  loading.value = true
  apiError.clear()

  try {
    const data = await $api<{ data: { id: string } }>(`/projects/${targetProjectId.value}/pages`, {
      method: 'POST',
      body: form,
    })
    open.value = false
    emit('created', { id: data.data.id, project_id: targetProjectId.value })
  }
  catch (e) {
    apiError.parse(e, t('Failed to add page.'))
  }
  finally {
    loading.value = false
  }
}
</script>
