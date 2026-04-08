<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="flex max-h-[90dvh] flex-col overflow-hidden">
      <div class="overflow-y-auto p-6">
        <!-- Header -->
        <div class="flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--ui-primary)/10">
            <UIcon name="i-lucide-globe" class="h-4.5 w-4.5 text-(--ui-primary)" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Add a page') }}</h2>
            <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ t('PawByTech analyzes one page at a time — not your entire website.') }}</p>
          </div>
        </div>

        <UForm :schema="tutorialActive ? undefined : schema" :state="form" class="mt-5 space-y-4" @submit="handleCreate">
          <UAlert
            v-if="apiError.hasErrors.value"
            color="error"
            variant="subtle"
            :title="apiError.displayMessage.value"
            icon="i-lucide-alert-circle"
          />

          <div data-tutorial="form-url">
            <UFormField :label="t('Page URL')" name="url">
              <UInput
                v-model="form.url"
                type="url"
                placeholder="https://example.com/landing"
                class="w-full"
                autofocus
                leading-icon="i-lucide-link"
              />
            </UFormField>
          </div>

          <!-- Project picker (shown when no projectId is locked) -->
          <div data-tutorial="form-project">
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
                <div v-if="showNewProjectInput" class="mt-2 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-3">
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
            </UFormField>

            <UFormField :label="t('Page name')" :hint="t('Optional')" name="name">
              <UInput
                v-model="form.name"
                :placeholder="t('My Landing Page')"
                class="w-full"
                leading-icon="i-lucide-tag"
              />
            </UFormField>
          </div>

          <div data-tutorial="form-ai-fields">
            <USeparator :label="t('Helps the AI tailor the audit')" class="my-1" />

          <div class="grid grid-cols-2 gap-3">
            <UFormField :label="t('Business type')" name="site_type">
              <USelect
                v-model="form.site_type"
                :items="siteTypes"
                class="w-full"
                :placeholder="t('Select type')"
              />
            </UFormField>

            <UFormField :label="t('Page type')" name="page_type">
              <USelect
                v-model="form.page_type"
                :items="pageTypes"
                class="w-full"
                :placeholder="t('Select type')"
              />
            </UFormField>
          </div>

            <UFormField :label="t('Primary conversion goal')" name="conversion_goal">
              <USelect
                v-model="form.conversion_goal"
                :items="conversionGoals"
                class="w-full"
                :placeholder="t('Select a conversion goal')"
              />
            </UFormField>

          <UFormField :label="t('Target audience')" :hint="t('Optional')" name="target_audience_description">
            <UTextarea
              v-model="form.target_audience_description"
              :placeholder="t('e.g. Small business owners looking for accounting software')"
              :rows="2"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Note for AI auditor')" :hint="t('Optional · max 300 chars')" name="ai_note">
            <UTextarea
              v-model="form.ai_note"
              :placeholder="t('e.g. Focus on the pricing section — we recently redesigned it. Ignore the blog link, it is under construction.')"
              :rows="2"
              :maxlength="300"
              class="w-full"
            />
          </UFormField>
        </div>

          <div data-tutorial="form-submit" class="flex justify-end gap-3 pt-2">
            <UButton variant="outline" color="neutral" @click="open = false">
              {{ t('Cancel') }}
            </UButton>
            <UButton type="submit" :loading="loading" :disabled="!targetProjectId">
              {{ t('Add page') }}
            </UButton>
          </div>
        </UForm>
      </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { createPageSchema } from '~/schemas/project'
import { useTutorialStore } from '~/stores/tutorial'

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
const { tutorialActive } = storeToRefs(useTutorialStore())
const apiError = useApiError()
const { siteTypes, pageTypes, conversionGoals } = useProjectOptions()
const { showOverlay } = useSuccessOverlay()

const schema = createPageSchema(t)

const form = reactive({
  url: '',
  name: '',
  site_type: '',
  page_type: '',
  conversion_goal: '',
  target_audience_description: '',
  ai_note: '',
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

function toggleNewProjectInput() {
  showNewProjectInput.value = !showNewProjectInput.value
  if (!showNewProjectInput.value) newProjectName.value = ''
}

function resetForm() {
  form.url = ''
  form.name = ''
  form.site_type = ''
  form.page_type = ''
  form.conversion_goal = ''
  form.target_audience_description = ''
  form.ai_note = ''
  showNewProjectInput.value = false
  newProjectName.value = ''
  apiError.clear()
}

watch(open, async (val) => {
  if (!val) {
    resetForm()
    return
  }
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
    const createdPage = { id: data.data.id, project_id: targetProjectId.value }
    open.value = false
    showOverlay({
      title: t("You're all set!"),
      subtitle: t('Page added successfully.'),
    })
    emit('created', createdPage)
  }
  catch (e) {
    apiError.parse(e, t('Failed to add page.'))
  }
  finally {
    loading.value = false
  }
}
</script>
