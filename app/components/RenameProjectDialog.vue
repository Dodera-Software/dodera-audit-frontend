<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <h2 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Rename project') }}</h2>
        <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ t('Enter a new name for this project.') }}</p>

        <UInput
          ref="inputRef"
          v-model="name"
          class="mt-4"
          :placeholder="t('Project name')"
          :error="nameError"
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
  projectId: string
  projectName: string
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
const nameError = ref('')
const saving = ref(false)
const inputRef = ref<{ input: HTMLInputElement } | null>(null)

watch(open, (val) => {
  if (!val) return
  name.value = props.projectName
  nameError.value = ''
  nextTick(() => inputRef.value?.input?.select())
})

async function handleRename() {
  nameError.value = ''
  const trimmed = name.value.trim()

  if (!trimmed) {
    nameError.value = t('Project name is required')
    return
  }

  if (trimmed === props.projectName) {
    open.value = false
    return
  }

  saving.value = true
  try {
    await $api(`/projects/${props.projectId}`, {
      method: 'PATCH',
      body: { name: trimmed },
    })
    toast.add({ title: t('Project renamed.'), color: 'success', icon: 'i-lucide-check' })
    emit('renamed', trimmed)
    open.value = false
  }
  catch {
    toast.add({ title: t('Failed to rename project.'), color: 'error', icon: 'i-lucide-x' })
  }
  finally {
    saving.value = false
  }
}
</script>
