<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Rename page') }}</h2>
        <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ t('Enter a display name for this page.') }}</p>

        <UInput
          ref="inputRef"
          v-model="name"
          class="mt-4"
          :placeholder="t('Page name (optional)')"
          @keydown.enter="handleRename"
        />

        <div class="mt-6 flex justify-end gap-3">
          <UButton variant="outline" @click="open = false">
            {{ t('Cancel') }}
          </UButton>
          <UButton :loading="saving" @click="handleRename">
            {{ t('Save') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  pageId: string
  pageName: string | null
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  renamed: [newName: string]
}>()

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()

const name = ref('')
const saving = ref(false)
const inputRef = ref<{ input: HTMLInputElement } | null>(null)

watch(open, (val) => {
  if (!val) return
  name.value = props.pageName ?? ''
  nextTick(() => inputRef.value?.input?.select())
})

async function handleRename() {
  const trimmed = name.value.trim()

  if (trimmed === (props.pageName ?? '')) {
    open.value = false
    return
  }

  saving.value = true
  try {
    await $api(`/pages/${props.pageId}`, {
      method: 'PATCH',
      body: { name: trimmed || null },
    })
    toast.add({ title: t('Page renamed.'), color: 'success', icon: 'i-lucide-check' })
    emit('renamed', trimmed)
    open.value = false
  }
  catch {
    toast.add({ title: t('Failed to rename page.'), color: 'error', icon: 'i-lucide-x' })
  }
  finally {
    saving.value = false
  }
}
</script>
