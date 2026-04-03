<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
            <UIcon name="i-lucide-trash-2" class="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Delete project') }}</h2>
            <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ projectName }}</p>
          </div>
        </div>

        <!-- No pages: simple warning -->
        <p v-if="pagesCount === 0" class="mt-5 text-sm text-(--ui-text-muted)">
          {{ t('This will permanently delete this project and cannot be undone.') }}
        </p>

        <!-- Has pages: show choice options, delete pre-selected -->
        <div v-else class="mt-5 space-y-2">
          <button
            class="flex w-full items-start gap-3 rounded-lg border border-(--ui-border) p-3 text-left transition-colors hover:bg-(--ui-bg-elevated)"
            :class="choice === 'keep' ? 'border-(--ui-primary) bg-(--ui-primary)/5' : ''"
            @click="choice = 'keep'"
          >
            <UIcon name="i-lucide-folder-input" class="mt-0.5 h-5 w-5 shrink-0 text-(--ui-primary)" />
            <div>
              <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Keep pages') }}</p>
              <p class="mt-0.5 text-xs text-(--ui-text-muted)">{{ t('Move all pages and their audits to the Default project, then delete this project.') }}</p>
            </div>
          </button>

          <button
            class="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-(--ui-bg-elevated)"
            :class="choice === 'delete' ? 'border-red-500 bg-red-500/5' : 'border-(--ui-border)'"
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
            color="error"
            :loading="deleting"
            @click="handleDelete"
          >
            {{ choice === 'keep' ? t('Move pages & delete project') : t('Delete project') }}
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

const choice = ref<'keep' | 'delete'>('delete')
const deleting = ref(false)

watch(open, (val) => {
  if (val) choice.value = 'delete'
})

async function handleDelete() {
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
