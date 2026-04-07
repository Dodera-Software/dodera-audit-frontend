<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--ui-primary)/10">
            <UIcon name="i-lucide-folder-plus" class="h-4.5 w-4.5 text-(--ui-primary)" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Create a project') }}</h2>
            <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ t('Projects are folders that group pages you want to audit.') }}</p>
          </div>
        </div>

        <UForm :schema="schema" :state="form" class="mt-5 space-y-4" @submit="handleCreate">
          <UAlert
            v-if="apiError.hasErrors.value"
            color="error"
            variant="subtle"
            :title="apiError.displayMessage.value"
            icon="i-lucide-alert-circle"
          />

          <UFormField :label="t('Project name')" name="name">
            <UInput
              v-model="form.name"
              :placeholder="t('My Website')"
              class="w-full"
              autofocus
              leading-icon="i-lucide-folder"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="outline" color="neutral" @click="open = false">
              {{ t('Cancel') }}
            </UButton>
            <UButton type="submit" :loading="loading">
              {{ t('Create project') }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { createProjectSchema } from '~/schemas/project'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  created: [project: { id: string, name: string }]
}>()

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const { showOverlay } = useSuccessOverlay()

const schema = createProjectSchema(t)

const form = reactive({ name: '' })
const loading = ref(false)

watch(open, (val) => {
  if (val) {
    form.name = ''
    apiError.clear()
  }
})

async function handleCreate() {
  loading.value = true
  apiError.clear()

  try {
    const data = await $api<{ data: { id: string, name: string } }>('/projects', {
      method: 'POST',
      body: form,
    })
    const createdProject = data.data
    open.value = false
    showOverlay({
      title: t("You're all set!"),
      subtitle: t('Project created successfully.'),
    })
    emit('created', createdProject)
    navigateTo(`/projects/${createdProject.id}`)
  }
  catch (e) {
    apiError.parse(e, t('Failed to create project.'))
  }
  finally {
    loading.value = false
  }
}
</script>
