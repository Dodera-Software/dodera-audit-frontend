<template>
  <ClientOnly>
    <div class="mx-auto max-w-2xl">
      <h1 class="font-display text-2xl font-bold text-(--ui-text-highlighted)">{{ t('Create new project') }}</h1>
      <p class="mt-1 text-(--ui-text-muted)">{{ t('Add a website to start auditing.') }}</p>

      <UCard class="mt-6">
        <UForm :schema="schema" :state="form" class="space-y-5" @submit="handleCreate">
          <UAlert
            v-if="apiError.hasErrors.value"
            color="error"
            variant="subtle"
            :title="apiError.displayMessage.value"
            icon="i-lucide-alert-circle"
          />

          <UFormField :label="t('Website URL')" name="url">
            <UInput
              v-model="form.url"
              type="url"
              placeholder="https://example.com"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Project name')" name="name">
            <UInput
              v-model="form.name"
              :placeholder="t('My Website')"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Site type')" name="site_type">
            <USelect
              v-model="form.site_type"
              :items="siteTypes"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Primary conversion goal')" name="conversion_goal">
            <USelect
              v-model="form.conversion_goal"
              :items="conversionGoals"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('Target audience')" name="target_audience_description">
            <UTextarea
              v-model="form.target_audience_description"
              :placeholder="t('Describe your target audience (optional)')"
              :rows="3"
              class="w-full"
            />
          </UFormField>

          <div class="flex gap-3">
            <UButton type="submit" :loading="loading" size="lg">
              {{ t('Create project') }}
            </UButton>
            <UButton variant="outline" size="lg" to="/dashboard">
              {{ t('Cancel') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { createProjectSchema } from '~/schemas/project'

definePageMeta({ middleware: 'auth' })

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

async function handleCreate() {
  loading.value = true
  apiError.clear()

  try {
    const data = await $api<{ data: { id: string } }>('/projects', {
      method: 'POST',
      body: form,
    })
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
