<template>
  <ClientOnly>
    <div class="flex flex-col gap-6">
      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Compose form -->
        <UCard class="lg:col-span-3">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-megaphone" class="h-4 w-4 text-(--ui-text-muted)" />
              <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Send announcement') }}</h2>
            </div>
          </template>

          <form class="flex flex-col gap-5" @submit.prevent="send">
            <UFormField :label="t('Title')" required>
              <UInput
                v-model="form.title"
                class="w-full"
                maxlength="200"
                :placeholder="t('Short, attention-grabbing title')"
              />
            </UFormField>

            <UFormField :label="t('Body')" required>
              <UTextarea
                v-model="form.body"
                class="w-full"
                :rows="4"
                maxlength="1000"
                :placeholder="t('Message content')"
              />
              <template #hint>
                <span class="text-[11px] text-(--ui-text-dimmed)">{{ form.body.length }} / 1000</span>
              </template>
            </UFormField>

            <div class="grid gap-5 sm:grid-cols-2">
              <UFormField :label="t('Icon (optional)')">
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="preset in iconPresets"
                    :key="preset"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
                    :class="iconButtonClass(preset)"
                    :aria-label="preset"
                    @click="selectIcon(preset)"
                  >
                    <UIcon :name="preset" class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors"
                    :class="customActive ? 'border-(--ui-primary) bg-(--ui-primary)/10 text-(--ui-primary)' : 'border-(--ui-border) text-(--ui-text-muted) hover:bg-(--ui-bg-muted)'"
                    @click="enableCustom"
                  >
                    <UIcon name="i-lucide-pen-line" class="h-3.5 w-3.5" />
                    {{ t('Custom') }}
                  </button>
                </div>
                <UInput
                  v-if="customActive"
                  v-model="form.icon"
                  class="mt-2 w-full"
                  maxlength="80"
                  placeholder="i-lucide-..."
                />
              </UFormField>

              <UFormField
                :label="t('Link (optional)')"
                :description="t('Opens when the user clicks the notification')"
              >
                <UInput
                  v-model="form.link"
                  class="w-full"
                  type="url"
                  maxlength="2048"
                  placeholder="/changelog"
                />
              </UFormField>
            </div>

            <UFormField
              :label="t('Send to plans')"
              :description="t('Leave empty to send to all users')"
            >
              <div class="flex flex-wrap gap-4">
                <UCheckbox
                  v-for="tier in planTiers"
                  :key="tier"
                  :model-value="form.plan_tiers.includes(tier)"
                  :label="tierLabel(tier)"
                  @update:model-value="(checked: boolean | string) => togglePlan(tier, !!checked)"
                />
              </div>
            </UFormField>

            <div class="flex items-center justify-end gap-2 border-t border-(--ui-border) pt-4">
              <UButton type="button" variant="ghost" color="neutral" :disabled="sending" @click="resetForm">
                {{ t('Reset') }}
              </UButton>
              <UButton type="submit" color="primary" icon="i-lucide-send" :loading="sending" :disabled="!canSend">
                {{ t('Send to users') }}
              </UButton>
            </div>
          </form>
        </UCard>

        <!-- Live preview -->
        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="h-4 w-4 text-(--ui-text-muted)" />
              <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Preview') }}</h2>
            </div>
          </template>

          <div class="flex items-start gap-3 rounded-md border border-(--ui-border) p-3">
            <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
              <UIcon :name="form.icon || 'i-lucide-megaphone'" class="h-4 w-4 text-amber-500" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-(--ui-text-highlighted)">
                {{ form.title || t('Your title appears here') }}
              </p>
              <p class="mt-1 line-clamp-4 text-xs text-(--ui-text-muted)">
                {{ form.body || t('Your message body will appear here.') }}
              </p>
              <p v-if="form.link" class="mt-2 truncate text-[11px] text-(--ui-primary)">
                → {{ form.link }}
              </p>
            </div>
          </div>

          <div class="mt-4 text-xs text-(--ui-text-muted)">
            <p class="font-medium text-(--ui-text-highlighted)">{{ t('Audience') }}</p>
            <p class="mt-1">
              <template v-if="form.plan_tiers.length === 0">
                {{ t('All users across every plan tier.') }}
              </template>
              <template v-else>
                {{ t('Only users on: {plans}', { plans: form.plan_tiers.join(', ') }) }}
              </template>
            </p>
          </div>
        </UCard>
      </div>

      <!-- Past announcements table -->
      <template v-if="table.loading.value">
        <AdminTableSkeleton :rows="6" />
      </template>

      <BaseDataTable
        v-else
        :row-data="(table.rows.value as unknown as Record<string, unknown>[])"
        :column-defs="columnDefs"
        :clickable="false"
        :pagination-meta="table.paginationMeta.value"
        :hide-search="false"
        :search-placeholder="t('Search announcements...')"
        :show-refresh="true"
        :loading="table.tableLoading.value"
        :default-col-def="{ sortable: false, filter: false, resizable: true }"
        @page-change="table.onPageChange"
        @search="table.onSearch"
        @refresh="table.onRefresh"
      >
        <template #title>
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Past announcements') }}</h2>
        </template>
        <template #actions>
          <UButton
            variant="ghost"
            color="error"
            size="sm"
            icon="i-lucide-trash-2"
            :disabled="table.rows.value.length === 0 || clearing"
            :loading="clearing"
            @click="clearAll"
          >
            {{ t('Clear all') }}
          </UButton>
        </template>
      </BaseDataTable>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community'
import DataTableIconCell from '~/components/DataTableIconCell.vue'

definePageMeta({ middleware: ['auth', 'admin'] })

interface Announcement {
  id: string
  title: string
  body: string
  icon: string | null
  link: string | null
  plan_tiers: string[] | null
  recipient_count: number
  sent_by: string | null
  created_at: string
}

const planTiers = ['free', 'pro', 'max'] as const
type PlanTier = typeof planTiers[number]

const iconPresets = [
  'i-lucide-megaphone',
  'i-lucide-sparkles',
  'i-lucide-gift',
  'i-lucide-rocket',
  'i-lucide-info',
  'i-lucide-triangle-alert',
  'i-lucide-zap',
  'i-lucide-party-popper',
  'i-lucide-calendar',
  'i-lucide-wrench',
  'i-lucide-book-open',
  'i-lucide-heart',
] as const

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const { confirm } = useConfirm()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

onMounted(() => setNavbar({ title: t('Announcements') }))

const emptyForm = () => ({
  title: '',
  body: '',
  icon: '',
  link: '',
  plan_tiers: [] as PlanTier[],
})

const form = reactive(emptyForm())
const sending = ref(false)
const clearing = ref(false)
const customActive = ref(false)

const canSend = computed(() => form.title.trim().length > 0 && form.body.trim().length > 0 && !sending.value)

function togglePlan(tier: PlanTier, checked: boolean) {
  if (checked) {
    if (!form.plan_tiers.includes(tier)) form.plan_tiers.push(tier)
  }
  else {
    form.plan_tiers = form.plan_tiers.filter(t => t !== tier)
  }
}

function tierLabel(tier: PlanTier): string {
  const labels: Record<PlanTier, string> = {
    free: t('Free'),
    pro: t('Pro'),
    max: t('Max'),
  }
  return labels[tier]
}

function selectIcon(preset: string) {
  form.icon = preset
  customActive.value = false
}

function enableCustom() {
  customActive.value = true
  if (iconPresets.includes(form.icon as typeof iconPresets[number])) {
    form.icon = ''
  }
}

function iconButtonClass(preset: string): string {
  return form.icon === preset && !customActive.value
    ? 'border-(--ui-primary) bg-(--ui-primary)/10 text-(--ui-primary)'
    : 'border-(--ui-border) text-(--ui-text-muted) hover:bg-(--ui-bg-muted)'
}

function resetForm() {
  Object.assign(form, emptyForm())
  customActive.value = false
}

const table = useServerDataTable<Announcement>({
  endpoint: '/admin/announcements',
  perPage: 25,
  errorMessage: t('Failed to load announcements.'),
})

const columnDefs = computed<ColDef[]>(() => [
  {
    headerName: t('Icon'),
    field: 'icon',
    width: 70,
    cellRenderer: DataTableIconCell,
    cellRendererParams: {
      fallback: 'i-lucide-megaphone',
      colorClass: 'text-amber-500',
    },
  },
  {
    headerName: t('Title'),
    field: 'title',
    flex: 1,
    minWidth: 200,
    cellClass: 'font-medium',
  },
  {
    headerName: t('Message'),
    field: 'body',
    flex: 2,
    minWidth: 260,
    tooltipField: 'body',
    cellClass: 'text-(--ui-text-muted)',
  },
  {
    headerName: t('Link'),
    field: 'link',
    flex: 1,
    minWidth: 160,
    cellRenderer: {
      name: 'LinkRenderer',
      render(cellProps: any) {
        const url: string | null = cellProps.params.value
        if (!url) return h('span', { class: 'text-(--ui-text-dimmed)' }, '—')
        const isExternal = /^https?:\/\//i.test(url)
        const label = isExternal
          ? (() => { try { return new URL(url).hostname } catch { return url } })()
          : url
        return h('a', {
          href: url,
          target: isExternal ? '_blank' : '_self',
          rel: isExternal ? 'noopener noreferrer' : undefined,
          class: 'text-(--ui-primary) hover:underline',
          onClick: (e: MouseEvent) => e.stopPropagation(),
        }, label)
      },
    } as any,
  },
  {
    headerName: t('Audience'),
    field: 'plan_tiers',
    width: 140,
    valueFormatter: (p: any) => {
      if (!p.value || (Array.isArray(p.value) && p.value.length === 0)) return t('All users')
      return (p.value as string[]).join(', ')
    },
  },
  {
    headerName: t('Recipients'),
    field: 'recipient_count',
    width: 120,
    type: 'rightAligned',
    valueFormatter: (p: any) => (p.value ?? 0).toLocaleString(),
  },
  {
    headerName: t('Sent by'),
    field: 'sent_by',
    width: 160,
    valueFormatter: (p: any) => p.value || t('System'),
  },
  {
    headerName: t('Sent at'),
    field: 'created_at',
    width: 170,
    valueFormatter: (p: any) => (p.value ? new Date(p.value).toLocaleString() : ''),
  },
])

async function clearAll() {
  const ok = await confirm({
    title: t('Clear all past announcements?'),
    description: t('This removes the admin history only. Notifications already delivered to users stay in their bells.'),
    confirmLabel: t('Clear all'),
    color: 'error',
  })
  if (!ok) return

  clearing.value = true
  try {
    await $api('/admin/announcements', { method: 'DELETE' })
    toast.add({ title: t('All announcements cleared'), color: 'success' })
    await table.fetch(1)
  }
  catch (e) {
    toast.add({ title: apiError.parse(e, t('Failed to clear announcements.')).message, color: 'error' })
  }
  finally {
    clearing.value = false
  }
}

async function send() {
  if (!canSend.value) return

  sending.value = true
  try {
    const body: Record<string, unknown> = {
      title: form.title.trim(),
      body: form.body.trim(),
    }
    if (form.icon.trim()) body.icon = form.icon.trim()
    if (form.link.trim()) body.link = form.link.trim()
    if (form.plan_tiers.length > 0) body.plan_tiers = form.plan_tiers

    await $api('/admin/announcements', { method: 'POST', body })
    toast.add({ title: t('Announcement queued for delivery'), color: 'success' })
    resetForm()
    await table.fetch(1)
  }
  catch (e) {
    toast.add({ title: apiError.parse(e, t('Failed to send announcement.')).message, color: 'error' })
  }
  finally {
    sending.value = false
  }
}
</script>
