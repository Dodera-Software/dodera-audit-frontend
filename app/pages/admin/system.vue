<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="loading">
        <AdminChartSkeleton />
        <AdminChartSkeleton />
        <AdminChartSkeleton />
      </template>

      <template v-else>
        <!-- Service Status -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Services') }}</h3>
              <div class="flex gap-2">
                <UButton icon="i-lucide-refresh-cw" variant="ghost" color="neutral" size="xs" @click="fetchAll">
                  {{ t('Refresh') }}
                </UButton>
                <UButton color="error" variant="soft" size="xs" :loading="resetting" @click="handleReset">
                  {{ t('Reset Database') }}
                </UButton>
              </div>
            </div>
          </template>
          <div v-if="Object.keys(health).length === 0" class="py-6 text-center text-sm text-(--ui-text-muted)">
            {{ t('No service data available.') }}
          </div>
          <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div v-for="(value, key) in health" :key="key" class="rounded-lg bg-(--ui-bg-elevated) p-3">
              <div class="flex items-center gap-2">
                <div class="h-2.5 w-2.5 rounded-full" :class="String(value) === 'ok' || !String(value).startsWith('down') ? 'bg-emerald-500' : 'bg-red-500'" />
                <span class="text-xs font-medium uppercase tracking-wider text-(--ui-text-dimmed)">{{ key }}</span>
              </div>
              <p class="mt-1 truncate text-sm font-medium text-(--ui-text-highlighted)">{{ value }}</p>
            </div>
          </div>
        </UCard>

        <!-- Table Sizes -->
        <UCard>
          <template #header>
            <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Database Tables') }}</h3>
          </template>
          <div v-if="tables.length === 0" class="py-6 text-center text-sm text-(--ui-text-muted)">
            {{ t('No table data available.') }}
          </div>
          <div v-else class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <div v-for="tbl in tables" :key="tbl.table" class="flex items-center justify-between rounded-md bg-(--ui-bg-elevated) px-3 py-2">
              <span class="truncate text-xs font-mono text-(--ui-text-muted)">{{ tbl.table }}</span>
              <span class="ml-2 shrink-0 text-xs font-bold text-(--ui-text-highlighted)">{{ tbl.rows >= 0 ? tbl.rows.toLocaleString() : 'N/A' }}</span>
            </div>
          </div>
        </UCard>

        <!-- Failed Jobs -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Failed Jobs') }}</h3>
              <UBadge v-if="failedJobs.length > 0" :label="`${failedJobs.length}`" color="error" variant="subtle" size="sm" />
            </div>
          </template>
          <div v-if="failedJobs.length === 0" class="py-6 text-center text-sm text-(--ui-text-muted)">
            {{ t('No failed jobs.') }}
          </div>
          <div v-else class="divide-y divide-(--ui-border)">
            <div v-for="job in failedJobs" :key="job.id" class="py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-(--ui-text-highlighted)">{{ job.queue }}</p>
                  <p class="mt-0.5 truncate text-xs font-mono text-(--ui-text-dimmed)">{{ job.uuid }}</p>
                  <p class="mt-1 line-clamp-2 text-xs text-red-500">{{ extractException(job.exception) }}</p>
                  <p class="mt-0.5 text-xs text-(--ui-text-dimmed)">{{ new Date(job.failed_at).toLocaleString() }}</p>
                </div>
                <div class="flex shrink-0 gap-1">
                  <UButton icon="i-lucide-rotate-ccw" variant="ghost" color="primary" size="xs" square :title="t('Retry')" @click="retryJob(job.uuid)" />
                  <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="xs" square :title="t('Delete')" @click="deleteJob(job.uuid)" />
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const { confirm } = useConfirm()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

onMounted(() => {
  setNavbar({ title: t('System') })
})

const loading = ref(true)
const resetting = ref(false)
const health = ref<Record<string, any>>({})
const tables = ref<any[]>([])
const failedJobs = ref<any[]>([])

function extractException(text: string): string {
  if (!text) return ''
  const firstLine = text.split('\n')[0] ?? ''
  return firstLine.length > 200 ? firstLine.slice(0, 200) + '...' : firstLine
}

async function fetchAll() {
  loading.value = true
  try {
    const [healthData, tablesData, jobsData] = await Promise.all([
      $api<any>('/admin/system/health'),
      $api<any>('/admin/system/tables'),
      $api<any>('/admin/system/failed-jobs'),
    ])
    health.value = healthData
    tables.value = tablesData.tables
    failedJobs.value = jobsData.data
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to load system info.')).message, color: 'error' })
  }
  finally {
    loading.value = false
  }
}

async function retryJob(uuid: string) {
  try {
    await $api(`/admin/system/failed-jobs/${uuid}/retry`, { method: 'POST' })
    toast.add({ title: t('Job queued for retry.'), color: 'success' })
    fetchAll()
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to retry job.')).message, color: 'error' })
  }
}

async function deleteJob(uuid: string) {
  try {
    await $api(`/admin/system/failed-jobs/${uuid}`, { method: 'DELETE' })
    toast.add({ title: t('Job deleted.'), color: 'success' })
    fetchAll()
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to delete job.')).message, color: 'error' })
  }
}

async function handleReset() {
  const ok = await confirm({
    title: t('Reset entire database?'),
    description: t('This will delete ALL data except admin users. This action cannot be undone.'),
    confirmLabel: t('Yes, reset everything'),
    color: 'error',
    icon: 'i-lucide-alert-triangle',
  })
  if (!ok) return
  resetting.value = true
  try {
    const data = await $api<any>('/admin/database/reset', { method: 'POST' })
    toast.add({ title: t('Database reset complete. {count} admin users kept.', { count: data.users_kept }), color: 'success' })
    fetchAll()
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to reset database.')).message, color: 'error' })
  }
  finally {
    resetting.value = false
  }
}

onMounted(() => fetchAll())
</script>
