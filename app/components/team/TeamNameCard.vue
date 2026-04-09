<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-building-2" class="h-4 w-4 text-(--ui-text-muted)" />
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Team') }}</h2>
      </div>
    </template>
    <div class="flex items-center justify-between gap-4">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium uppercase tracking-wide text-(--ui-text-dimmed)">{{ t('Team name') }}</p>
        <UInput
          v-if="editing"
          v-model="localName"
          size="lg"
          class="mt-1 max-w-xs"
          @keyup.enter="handleSave"
          @keyup.escape="editing = false"
        />
        <p v-else class="mt-1 font-semibold text-(--ui-text-highlighted)">{{ props.teamName }}</p>
      </div>
      <div class="flex gap-2">
        <template v-if="editing">
          <UButton size="sm" :loading="props.loading" @click="handleSave">{{ t('Save') }}</UButton>
          <UButton size="sm" variant="ghost" color="neutral" @click="editing = false">{{ t('Cancel') }}</UButton>
        </template>
        <UButton v-else size="sm" variant="ghost" color="neutral" icon="i-lucide-pencil" @click="startEdit">
          {{ t('Edit') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  teamName: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  save: [name: string]
}>()

const { t } = useI18n()

const editing = ref(false)
const localName = ref('')

function startEdit() {
  localName.value = props.teamName
  editing.value = true
}

function handleSave() {
  if (!localName.value.trim()) return
  emit('save', localName.value.trim())
  editing.value = false
}
</script>
