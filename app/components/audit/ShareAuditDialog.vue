<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-md' }">
    <template #content>
      <div class="flex flex-col items-center px-6 py-5">
        <div class="flex h-11 w-11 items-center justify-center rounded-full bg-(--ui-primary)/10">
          <UIcon name="i-lucide-share-2" class="h-5 w-5 text-(--ui-primary)" />
        </div>

        <h2 class="mt-3 text-base font-semibold text-(--ui-text-highlighted)">{{ t('Share audit report') }}</h2>
        <p class="mt-1 text-center text-sm text-(--ui-text-muted)">
          {{ t('Generate a public link to share this audit report. Anyone with the link can view it.') }}
        </p>

        <!-- Loading state -->
        <div v-if="loading" class="mt-5 flex w-full items-center justify-center py-4">
          <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-(--ui-text-muted)" />
        </div>

        <!-- Active link -->
        <div v-else-if="shareData?.active" class="mt-5 w-full space-y-3">
          <div class="flex items-center gap-2 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated) p-2.5">
            <UInput
              :model-value="shareData.url"
              readonly
              size="sm"
              class="flex-1"
              @focus="($event.target as HTMLInputElement)?.select()"
            />
            <UButton
              size="sm"
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              :color="copied ? 'success' : 'primary'"
              variant="soft"
              @click="handleCopy"
            >
              {{ copied ? t('Copied') : t('Copy') }}
            </UButton>
          </div>

          <div class="flex items-center justify-between text-xs text-(--ui-text-dimmed)">
            <div class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="h-3 w-3" />
              <span>{{ t('Expires {date}', { date: formatRelativeDate(shareData.expires_at) }) }}</span>
            </div>
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              :loading="revoking"
              @click="handleRevoke"
            >
              {{ t('Revoke link') }}
            </UButton>
          </div>
        </div>

        <!-- No active link -->
        <div v-else class="mt-5 w-full">
          <UButton
            block
            size="lg"
            icon="i-lucide-link"
            :loading="generating"
            @click="handleGenerate"
          >
            {{ t('Generate share link') }}
          </UButton>
          <p class="mt-2 text-center text-xs text-(--ui-text-dimmed)">
            {{ t('Link expires after 7 days. Previous links are automatically revoked.') }}
          </p>
        </div>

        <!-- Branding note -->
        <div class="mt-4 flex items-center gap-1.5 text-xs text-(--ui-text-dimmed)">
          <UIcon name="i-lucide-sparkles" class="h-3 w-3" />
          <span>{{ t('Shared reports include PawByTech branding') }}</span>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  auditId: string
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { $api } = useApi()
const { formatDate } = useFormatters()
const toast = useToast()

const loading = ref(false)
const generating = ref(false)
const revoking = ref(false)
const copied = ref(false)
const shareData = ref<{ active: boolean, url?: string, token?: string, expires_at?: string } | null>(null)

function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return ''
  return formatDate(dateStr)
}

watch(open, async (val) => {
  if (val) {
    copied.value = false
    await fetchShareStatus()
  }
})

async function fetchShareStatus() {
  loading.value = true
  try {
    shareData.value = await $api<any>(`/audits/${props.auditId}/share`)
  }
  catch {
    shareData.value = { active: false }
  }
  finally {
    loading.value = false
  }
}

async function handleGenerate() {
  generating.value = true
  try {
    const data = await $api<any>(`/audits/${props.auditId}/share`, { method: 'POST' })
    shareData.value = { active: true, url: data.url, token: data.token, expires_at: data.expires_at }
    toast.add({ title: t('Share link generated!'), color: 'success' })
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? t('Failed to generate link.'), color: 'error' })
  }
  finally {
    generating.value = false
  }
}

async function handleRevoke() {
  revoking.value = true
  try {
    await $api(`/audits/${props.auditId}/share`, { method: 'DELETE' })
    shareData.value = { active: false }
    toast.add({ title: t('Share link revoked.'), color: 'success' })
  }
  catch {
    toast.add({ title: t('Failed to revoke link.'), color: 'error' })
  }
  finally {
    revoking.value = false
  }
}

async function handleCopy() {
  if (!shareData.value?.url) return
  await navigator.clipboard.writeText(shareData.value.url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
