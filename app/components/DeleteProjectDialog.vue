<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
            <UIcon name="i-lucide-trash-2" class="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Delete {name}?', { name: projectName }) }}</h2>
            <p v-if="pagesCount > 0" class="mt-0.5 text-sm text-(--ui-text-muted)">
              {{ t('This project contains {count} pages with audit data.', { count: pagesCount }) }}
            </p>
          </div>
        </div>

        <div class="mt-6 space-y-2">
          <!-- Option: Keep pages -->
          <button
            v-if="pagesCount > 0"
            class="flex w-full items-start gap-3 rounded-lg border border-(--ui-border) p-3 text-left transition-colors hover:bg-(--ui-bg-elevated)"
            :class="{ 'border-(--ui-primary) bg-(--ui-primary)/5': choice === 'keep' }"
            @click="choice = 'keep'"
          >
            <UIcon name="i-lucide-folder-input" class="mt-0.5 h-5 w-5 shrink-0 text-(--ui-primary)" />
            <div>
              <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Keep pages') }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">{{ t('Move all pages and their audits to the Default project, then delete this project.') }}</p>
            </div>
          </button>

          <!-- Option: Delete everything -->
          <button
            class="flex w-full items-start gap-3 rounded-lg border border-(--ui-border) p-3 text-left transition-colors hover:bg-(--ui-bg-elevated)"
            :class="{ 'border-red-500 bg-red-500/5': choice === 'delete' }"
            @click="choice = 'delete'"
          >
            <UIcon name="i-lucide-trash-2" class="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Delete everything') }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">{{ t('Permanently delete this project, all pages, and all audit history. This cannot be undone.') }}</p>
            </div>
          </button>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <UButton variant="outline" @click="open = false">
            {{ t('Cancel') }}
          </UButton>
          <UButton
            :color="choice === 'delete' ? 'error' : 'primary'"
            :loading="deleting"
            :disabled="!choice"
            @click="handleDelete"
          >
            {{ choice === 'keep' ? t('Move pages & delete project') : t('Delete everything') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: string
  projectName: string
  pagesCount: number
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useI18n()
const { $api } = useApi()

const choice = ref<'keep' | 'delete' | null>(null)
const deleting = ref(false)

watch(open, (val) => {
  if (val) {
    choice.value = props.pagesCount > 0 ? 'keep' : 'delete'
  }
})

async function handleDelete() {
  if (!choice.value) return
  deleting.value = true

  try {
    const params = choice.value === 'keep' ? '?keep_pages=1' : ''
    await $api(`/projects/${props.projectId}${params}`, { method: 'DELETE' })
    open.value = false
    emit('deleted')
  }
  catch {
    // silent
  }
  finally {
    deleting.value = false
  }
}
</script>
