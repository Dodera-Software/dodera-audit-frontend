<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--ui-primary)/10">
            <UIcon name="i-lucide-refresh-cw" class="h-5 w-5 text-(--ui-primary)" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Run new audit') }}</h3>
            <p class="text-sm text-(--ui-text-muted)">{{ t('A full re-audit of your page') }}</p>
          </div>
        </div>

        <div class="mt-5 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-4">
          <div class="flex items-start gap-2.5">
            <UIcon name="i-lucide-lightbulb" class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div class="text-sm text-(--ui-text-muted)">
              <p class="font-medium text-(--ui-text-highlighted)">{{ t('Before re-auditing') }}</p>
              <p class="mt-1">
                {{ t('For best results, review your Issue Board and fix as many issues as possible before running a new audit. The audit will automatically detect which issues have been resolved and which remain.') }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="openIssueCount > 0" class="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
          <UIcon name="i-lucide-alert-circle" class="h-4 w-4 shrink-0 text-amber-600" />
          <p class="text-sm text-amber-700 dark:text-amber-400">
            {{ t('You have {n} open issue(s) on your board.', { n: openIssueCount }) }}
          </p>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton variant="ghost" @click="open = false">{{ t('Cancel') }}</UButton>
          <UButton
            :loading="submitting"
            @click="submit"
          >
            {{ t('Start audit') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{ pageId: string, openIssueCount?: number }>()
const emit = defineEmits<{ started: [auditId: string] }>()

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const open = defineModel<boolean>({ default: false })

const submitting = ref(false)

async function submit() {
  submitting.value = true
  try {
    const data = await $api<{ data: { id: string } }>(`/pages/${props.pageId}/audits`, {
      method: 'POST',
    })
    open.value = false
    emit('started', data.data.id)
  }
  catch (e) {
    apiError.parse(e, t('Failed to start audit.'))
  }
  finally {
    submitting.value = false
  }
}
</script>
