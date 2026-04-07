<template>
  <UButton
    icon="i-lucide-graduation-cap"
    :variant="variant"
    :color="color"
    :size="size"
    :block="block"
    :class="block ? 'justify-start' : ''"
    @click="handleClick"
  >
    {{ t('Product tour') }}
  </UButton>
</template>

<script setup lang="ts">
import { useTutorialStore } from '~/stores/tutorial'

interface Props {
  variant?: 'ghost' | 'solid' | 'soft' | 'outline' | 'link'
  color?: 'neutral' | 'primary'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  color: 'neutral',
  size: 'sm',
  block: false,
})

const emit = defineEmits<{
  click: []
}>()

const { t } = useI18n()
const tutorialStore = useTutorialStore()

async function handleClick(): Promise<void> {
  emit('click')
  await nextTick()
  tutorialStore.restart()
}
</script>
