<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <h2 class="text-lg font-bold text-(--ui-text-highlighted)">{{ t('Audit a new page') }}</h2>
        <p class="mt-1 text-sm text-(--ui-text-muted)">{{ t('Each project tracks one page. Enter the exact URL you want to audit.') }}</p>

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
              placeholder="https://example.com"
              class="w-full"
            />
            <p class="mt-1 text-xs text-(--ui-text-dimmed)">{{ t('GhostAudit analyzes one page at a time — not your entire website.') }}</p>
          </UFormField>

          <UFormField :label="t('Project name')" name="name">
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
            <UButton type="submit" :loading="loading">
              {{ t('Start page audit') }}
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

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const { siteTypes, conversionGoals } = useProjectOptions()

const schema = createProjectSchema(t)

const form = reactive({
  name: '',
  url: '',
  site_type: '',
  conversion_goal: '',
  target_audience_description: '',
})

const loading = ref(false)

function resetForm() {
  form.name = ''
  form.url = ''
  form.site_type = ''
  form.conversion_goal = ''
  form.target_audience_description = ''
  apiError.clear()
}

watch(open, (val) => {
  if (val) resetForm()
})

async function handleCreate() {
  loading.value = true
  apiError.clear()

  try {
    const data = await $api<{ data: { id: string } }>('/projects', {
      method: 'POST',
      body: form,
    })
    open.value = false
    navigateTo(`/projects/${data.data.id}`)
  }
  catch (e) {
    apiError.parse(e, t('Failed to create project.'))
  }
  finally {
    loading.value = false
  }
}
</script>
