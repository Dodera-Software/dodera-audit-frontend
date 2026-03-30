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
            <UButton type="submit" :loading="loading">
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
  projectId: string
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  created: [page: { id: string }]
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

function resetForm() {
  form.url = ''
  form.name = ''
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
    const data = await $api<{ data: { id: string } }>(`/projects/${props.projectId}/pages`, {
      method: 'POST',
      body: form,
    })
    open.value = false
    emit('created', data.data)
  }
  catch (e) {
    apiError.parse(e, t('Failed to add page.'))
  }
  finally {
    loading.value = false
  }
}
</script>
