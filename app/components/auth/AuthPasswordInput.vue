<template>
  <UInput
    :model-value="modelValue"
    :type="show ? 'text' : 'password'"
    :autocomplete="autocomplete"
    :placeholder="placeholder"
    :icon="icon"
    size="lg"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event as string)"
  >
    <template #trailing>
      <UButton
        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        variant="ghost"
        color="neutral"
        size="sm"
        :aria-label="show ? t('Hide password') : t('Show password')"
        @click="show = !show"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  autocomplete?: string
  placeholder?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  autocomplete: 'current-password',
  placeholder: '••••••••',
  icon: 'i-lucide-lock',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const show = ref(false)
</script>
