<template>
  <div class="space-y-3">
    <!-- Viewport toggle -->
    <div class="flex gap-2">
      <UButton
        :variant="activeViewport === 'desktop' ? 'solid' : 'outline'"
        size="sm"
        icon="i-lucide-monitor"
        @click="activeViewport = 'desktop'"
      >
        {{ t('Desktop') }}
      </UButton>
      <UButton
        :variant="activeViewport === 'mobile' ? 'solid' : 'outline'"
        size="sm"
        icon="i-lucide-smartphone"
        @click="activeViewport = 'mobile'"
      >
        {{ t('Mobile') }}
      </UButton>
    </div>

    <!-- Screenshot container -->
    <div
      ref="containerRef"
      class="relative overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated)"
      :class="activeViewport === 'mobile' ? 'max-w-sm mx-auto' : ''"
    >
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-(--ui-text-muted)" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex flex-col items-center justify-center gap-4 py-32">
        <UIcon name="i-lucide-image-off" class="h-12 w-12 text-(--ui-text-muted)" />
        <p class="text-sm text-(--ui-text-muted)">{{ t('Failed to load screenshot') }}</p>
        <UButton size="sm" variant="outline" @click="retryLoad">
          {{ t('Retry') }}
        </UButton>
      </div>

      <!-- Screenshot + annotations -->
      <div v-else-if="currentUrl" class="relative">
        <img
          ref="imageRef"
          :src="currentUrl"
          :alt="t('Website screenshot')"
          class="block w-full"
          @load="onImageLoad"
          @error="onImageError"
        >

        <!-- Annotation overlays -->
        <template v-if="imageLoaded">
          <div
            v-for="(annotation, index) in currentAnnotations"
            :key="annotation.issue_id"
            class="absolute cursor-pointer border-2 transition-all hover:brightness-110"
            :style="annotationStyle(annotation)"
            :class="[
              selectedIssueId === annotation.issue_id ? 'ring-2 ring-white ring-offset-2' : 'opacity-60 hover:opacity-100',
              pinVisible[index] ? 'scale-100' : 'scale-0',
            ]"
            @click="$emit('selectIssue', annotation.issue_id)"
          >
            <!-- Pin number -->
            <div
              class="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
              :style="{ backgroundColor: annotation.color }"
            >
              {{ annotation.pin_number }}
            </div>
          </div>
        </template>
      </div>

      <!-- No screenshot -->
      <div v-else class="flex items-center justify-center py-32">
        <p class="text-sm text-(--ui-text-muted)">{{ t('No screenshot available') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Annotation {
  issue_id: string
  pin_number: number
  x: number
  y: number
  width: number
  height: number
  color: string
  viewport: string
  has_bounding_box: boolean
}

const props = defineProps<{
  desktopUrl?: string | null
  mobileUrl?: string | null
  annotations?: Annotation[]
  selectedIssueId?: string | null
}>()

defineEmits<{
  selectIssue: [issueId: string]
}>()

const { t } = useI18n()

const activeViewport = ref<'desktop' | 'mobile'>('desktop')
const imageRef = ref<HTMLImageElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const imageLoaded = ref(false)
const loading = ref(true)
const error = ref(false)
const naturalWidth = ref(0)
const pinVisible = ref<boolean[]>([])

const currentUrl = computed(() =>
  activeViewport.value === 'desktop' ? props.desktopUrl : props.mobileUrl,
)

const currentAnnotations = computed(() =>
  (props.annotations || []).filter(a => a.viewport === activeViewport.value),
)

const scaleFactor = computed(() => {
  if (!containerRef.value || !naturalWidth.value) return 1
  return containerRef.value.clientWidth / naturalWidth.value
})

function annotationStyle(annotation: Annotation) {
  const scale = scaleFactor.value
  return {
    left: `${annotation.x * scale}px`,
    top: `${annotation.y * scale}px`,
    width: `${annotation.width * scale}px`,
    height: `${annotation.height * scale}px`,
    borderColor: annotation.color,
    backgroundColor: `${annotation.color}20`,
  }
}

function onImageLoad() {
  if (imageRef.value) {
    naturalWidth.value = imageRef.value.naturalWidth
  }
  imageLoaded.value = true
  loading.value = false
  error.value = false
  animatePins()
}

function onImageError() {
  loading.value = false
  error.value = true
  imageLoaded.value = false
}

function retryLoad() {
  loading.value = true
  error.value = false
  imageLoaded.value = false
}

function animatePins() {
  pinVisible.value = currentAnnotations.value.map(() => false)
  currentAnnotations.value.forEach((_, index) => {
    setTimeout(() => {
      pinVisible.value[index] = true
    }, index * 50)
  })
}

watch(activeViewport, () => {
  imageLoaded.value = false
  loading.value = true
  error.value = false
  pinVisible.value = []
})

watch(currentAnnotations, () => {
  if (imageLoaded.value) {
    animatePins()
  }
})
</script>
