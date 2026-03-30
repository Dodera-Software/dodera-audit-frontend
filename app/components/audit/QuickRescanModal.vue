<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Quick re-scan') }}</h3>
        <p class="mt-1 text-sm text-(--ui-text-muted)">
          {{ t('Select the categories you\'ve improved. Only those agents will re-run, making this much faster.') }}
        </p>

        <div class="mt-5 space-y-2">
          <label
            v-for="cat in CATEGORIES"
            :key="cat.key"
            class="flex cursor-pointer items-center gap-3 rounded-lg border border-(--ui-border) px-3 py-2.5 transition-colors hover:bg-(--ui-bg-elevated)"
            :class="{ 'border-(--ui-primary) bg-(--ui-primary)/5': selected.has(cat.key) }"
          >
            <UCheckbox
              :model-value="selected.has(cat.key)"
              @update:model-value="toggle(cat.key)"
            />
            <UIcon :name="cat.icon" class="h-4 w-4 text-(--ui-text-muted)" />
            <span class="text-sm font-medium text-(--ui-text)">{{ cat.label() }}</span>
          </label>
        </div>

        <div class="mt-6 flex items-center justify-between gap-3">
          <p class="text-xs text-(--ui-text-dimmed)">
            {{ selected.size > 0 ? t('{n} categories selected', { n: selected.size }) : t('Select at least one category') }}
          </p>
          <div class="flex gap-2">
            <UButton variant="ghost" @click="open = false">{{ t('Cancel') }}</UButton>
            <UButton
              :disabled="selected.size === 0 || submitting"
              :loading="submitting"
              @click="submit"
            >
              {{ t('Start re-scan') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{ pageId: string }>()
const emit = defineEmits<{ started: [auditId: string] }>()

const { t } = useI18n()
const { $api } = useApi()
const apiError = useApiError()
const open = defineModel<boolean>({ default: false })

const CATEGORIES = computed(() => [
  { key: 'clarity', icon: 'i-lucide-type', label: () => t('Clarity') },
  { key: 'trust', icon: 'i-lucide-shield-check', label: () => t('Trust') },
  { key: 'conversion', icon: 'i-lucide-target', label: () => t('Conversion') },
  { key: 'performance', icon: 'i-lucide-zap', label: () => t('Performance') },
  { key: 'technical', icon: 'i-lucide-code', label: () => t('Technical') },
  { key: 'accessibility', icon: 'i-lucide-accessibility', label: () => t('Accessibility') },
  { key: 'seo', icon: 'i-lucide-search', label: () => t('SEO') },
])

const selected = ref<Set<string>>(new Set())
const submitting = ref(false)

function toggle(key: string) {
  if (selected.value.has(key)) {
    selected.value.delete(key)
  }
  else {
    selected.value.add(key)
  }
}

async function submit() {
  if (selected.value.size === 0) return
  submitting.value = true
  try {
    const data = await $api<{ data: { id: string } }>(`/pages/${props.pageId}/audits/partial`, {
      method: 'POST',
      body: { changed_categories: Array.from(selected.value) },
    })
    open.value = false
    selected.value = new Set()
    emit('started', data.data.id)
  }
  catch (e) {
    apiError.parse(e, t('Failed to start re-scan.'))
  }
  finally {
    submitting.value = false
  }
}
</script>
