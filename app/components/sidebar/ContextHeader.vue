<template>
  <!-- Admin context header -->
  <div v-if="isAdmin" class="border-b border-(--ui-border) px-3 py-2">
    <UButton
      variant="ghost"
      color="neutral"
      size="xs"
      icon="i-lucide-arrow-left"
      to="/dashboard"
      class="mb-1"
      @click="$emit('navigate')"
    >
      {{ t('Back to app') }}
    </UButton>
    <div class="flex items-center gap-2 px-2">
      <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-500/10">
        <UIcon name="i-lucide-shield" class="h-3.5 w-3.5 text-red-500" />
      </div>
      <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Admin') }}</span>
    </div>
  </div>

  <!-- Project/Page context header -->
  <div v-else-if="projectId" class="border-b border-(--ui-border) px-3 py-2">
    <template v-if="pageId">
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-lucide-arrow-left"
        :to="`/projects/${projectId}`"
        class="mb-1"
        @click="$emit('navigate')"
      >
        {{ projectName || t('Back to project') }}
      </UButton>
      <div class="flex items-center gap-2 px-2">
        <img
          v-if="pageUrl"
          :src="`https://www.google.com/s2/favicons?domain=${pageUrl.replace(/^https?:\/\//, '').split('/')[0]}&sz=32`"
          class="h-5 w-5 rounded"
          loading="lazy"
        >
        <span class="truncate text-sm font-semibold text-(--ui-text-highlighted)">{{ pageName }}</span>
      </div>
    </template>
    <template v-else>
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-lucide-arrow-left"
        to="/projects"
        class="mb-1"
        @click="$emit('navigate')"
      >
        {{ t('All projects') }}
      </UButton>
      <div class="flex items-center gap-2 px-2">
        <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-(--ui-primary)/10">
          <UIcon name="i-lucide-folder" class="h-3.5 w-3.5 text-(--ui-primary)" />
        </div>
        <span class="truncate text-sm font-semibold text-(--ui-text-highlighted)">{{ projectName }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  navigate: []
}>()

const { t } = useI18n()
const route = useRoute()
const { $api } = useApi()

const isAdmin = computed(() => route.path.startsWith('/admin'))

const projectId = computed(() => {
  const match = route.path.match(/^\/projects\/([^/]+)/)
  return match?.[1] ?? null
})

const pageId = computed(() => {
  const match = route.path.match(/^\/projects\/[^/]+\/pages\/([^/]+)/)
  return match?.[1] ?? null
})

const projectName = ref('')
const pageName = ref('')
const pageUrl = ref('')

watch(projectId, async (id) => {
  if (!id) {
    projectName.value = ''
    return
  }
  try {
    const data = await $api<{ data: { name: string } }>(`/projects/${id}`)
    projectName.value = data.data.name
  }
  catch {
    projectName.value = ''
  }
}, { immediate: true })

watch(pageId, async (id) => {
  if (!id) {
    pageName.value = ''
    pageUrl.value = ''
    return
  }
  try {
    const data = await $api<{ data: { name: string | null, url: string } }>(`/pages/${id}`)
    pageUrl.value = data.data.url
    pageName.value = data.data.name || new URL(data.data.url).hostname
  }
  catch {
    pageName.value = ''
    pageUrl.value = ''
  }
}, { immediate: true })

defineExpose({ projectId, pageId, isAdmin })
</script>
