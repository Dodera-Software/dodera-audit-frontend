<template>
  <div>
    <!-- Page header -->
    <div>
      <h1 class="text-xl font-bold text-(--ui-text-highlighted)">
        {{ t('Admin dashboard') }}
      </h1>
      <p class="mt-0.5 text-sm text-(--ui-text-muted)">{{ t('Manage users, audits and platform settings.') }}</p>
    </div>

    <!-- Quick actions -->
    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-(--ui-primary)/10">
            <UIcon name="i-lucide-users" class="h-5 w-5 text-(--ui-primary)" />
          </div>
          <div>
            <p class="text-2xl font-bold text-(--ui-text-highlighted)">{{ stats.total_users }}</p>
            <p class="text-xs text-(--ui-text-muted)">{{ t('Total users') }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <UIcon name="i-lucide-file-text" class="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-(--ui-text-highlighted)">{{ stats.total_audits }}</p>
            <p class="text-xs text-(--ui-text-muted)">{{ t('Total audits') }}</p>
          </div>
        </div>
      </UCard>

      <UCard class="sm:col-span-2 lg:col-span-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <UIcon name="i-lucide-database" class="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Reset Database') }}</p>
              <p class="text-xs text-(--ui-text-muted)">{{ t('Erase all data except admins') }}</p>
            </div>
          </div>
          <UButton
            color="error"
            variant="soft"
            size="sm"
            :loading="resetting"
            @click="handleReset"
          >
            {{ t('Reset') }}
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Users table -->
    <div v-if="loading" class="mt-6 flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-(--ui-text-muted)" />
    </div>

    <BaseDataTable
      v-else
      class="mt-6"
      :row-data="users"
      :column-defs="columnDefs"
      :clickable="false"
      :pagination-meta="paginationMeta"
      :row-actions="getRowActions"
      :hide-search="false"
      :search-placeholder="t('Search by name or email...')"
      :show-refresh="true"
      :default-col-def="{ sortable: true, filter: false, resizable: true }"
      @grid-ready="onGridReady"
      @page-change="fetchUsers"
      @search="onSearch"
      @refresh="() => fetchUsers(paginationMeta.currentPage)"
    >
      <template #title>
        <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('Users') }}</h2>
      </template>
      <template #actions>
        <UButton
          icon="i-lucide-user-plus"
          size="sm"
          @click="showCreateModal = true"
        >
          {{ t('Create user') }}
        </UButton>
      </template>
    </BaseDataTable>

    <!-- Create user modal -->
    <UModal v-model:open="showCreateModal">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">{{ t('Create user') }}</h3>

          <UFormField :label="t('Name')">
            <UInput v-model="createForm.name" class="w-full" />
          </UFormField>

          <UFormField :label="t('Email')">
            <UInput v-model="createForm.email" type="email" class="w-full" />
          </UFormField>

          <UFormField :label="t('Password')">
            <UInput v-model="createForm.password" type="password" class="w-full" />
          </UFormField>

          <UFormField :label="t('Plan')">
            <USelect v-model="createForm.plan" :items="planSelectOptions" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="neutral" @click="showCreateModal = false">
              {{ t('Cancel') }}
            </UButton>
            <UButton :loading="creating" :disabled="!createForm.name || !createForm.email || !createForm.password" @click="handleCreate">
              {{ t('Create') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community'
import type { PaginationMeta, RowAction } from '~/components/BaseDataTable.vue'

definePageMeta({ middleware: ['auth', 'admin'] })

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const { confirm } = useConfirm()
const authStore = useAuthStore()
const { fetchMe } = useAuth()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

// State
const users = ref<any[]>([])
const loading = ref(true)
const resetting = ref(false)
const searchValue = ref('')
let gridApi: GridApi | null = null

const stats = reactive({ total_users: 0, total_audits: 0 })

const paginationMeta = ref<PaginationMeta>({
  currentPage: 1, lastPage: 1, total: 0, from: 0, to: 0,
})

// Create user
const showCreateModal = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', email: '', password: '', plan: 'free' })
const planSelectOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Pro', value: 'pro' },
  { label: 'Max', value: 'max' },
]

async function handleCreate() {
  creating.value = true
  try {
    await $api('/admin/users', { method: 'POST', body: { ...createForm } })
    toast.add({ title: t('User created.'), color: 'success' })
    showCreateModal.value = false
    createForm.name = ''
    createForm.email = ''
    createForm.password = ''
    createForm.plan = 'free'
    fetchUsers(1)
  }
  catch (e: any) {
    const err = apiError.parse(e, t('Failed to create user.'))
    toast.add({ title: err.message, color: 'error' })
  }
  finally {
    creating.value = false
  }
}

// Row actions — passed to BaseDataTable
function getRowActions(row: any): RowAction[] {
  const actions: RowAction[] = []

  if (!row.email_verified_at) {
    actions.push({
      label: t('Verify email'),
      icon: 'i-lucide-mail-check',
      color: 'success',
      onSelect: () => handleVerifyEmail(row),
    })
  }

  if (!row.is_admin) {
    actions.push({
      label: t('Delete user'),
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => handleDelete(row),
    })
  }

  return actions
}

// Column definitions
const planOptions = ['free', 'pro', 'max']

const columnDefs = computed<ColDef[]>(() => [
  {
    headerName: t('Name'),
    field: 'name',
    editable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: t('Email'),
    field: 'email',
    editable: true,
    flex: 1.5,
    minWidth: 200,
  },
  {
    headerName: t('Plan'),
    field: 'plan',
    editable: true,
    width: 100,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: planOptions },
    cellClass: (params: any) => {
      if (params.value === 'max') return 'text-purple-600 font-semibold'
      if (params.value === 'pro') return 'text-blue-600 font-semibold'
      return 'text-(--ui-text-muted)'
    },
  },
  {
    headerName: t('Admin'),
    field: 'is_admin',
    editable: true,
    width: 90,
    cellDataType: 'boolean',
  },
  {
    headerName: t('Extra Seats'),
    field: 'extra_seats',
    editable: true,
    width: 120,
    cellDataType: 'number',
  },
  {
    headerName: t('Verified'),
    field: 'email_verified_at',
    editable: false,
    width: 100,
    valueFormatter: (params: any) => params.value ? 'Yes' : 'No',
    cellClass: (params: any) => params.value ? 'text-emerald-600' : 'text-red-500',
  },
  {
    headerName: t('Created'),
    field: 'created_at',
    editable: false,
    width: 130,
    valueFormatter: (params: any) => {
      if (!params.value) return ''
      return new Date(params.value).toLocaleDateString()
    },
  },
])

function onGridReady(event: GridReadyEvent) {
  gridApi = event.api

  gridApi.addEventListener('cellValueChanged', async (e: CellValueChangedEvent) => {
    const { data, colDef, newValue, oldValue } = e
    if (newValue === oldValue) return

    const field = colDef.field!
    try {
      await $api(`/admin/users/${data.id}`, {
        method: 'PATCH',
        body: { [field]: newValue },
      })
      toast.add({ title: t('User updated.'), color: 'success' })

      if (data.id === authStore.user?.id) {
        await fetchMe()
      }
    }
    catch (err: any) {
      data[field] = oldValue
      gridApi?.refreshCells({ rowNodes: [e.node], force: true })
      const parsed = apiError.parse(err, t('Failed to update user.'))
      toast.add({ title: parsed.message, color: 'error' })
    }
  })
}

// Fetch users
async function fetchUsers(page = 1) {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page), per_page: '25' })
    if (searchValue.value) params.set('search', searchValue.value)

    const data = await $api<any>(`/admin/users?${params}`)
    users.value = data.data
    paginationMeta.value = {
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      total: data.meta.total,
      from: data.meta.from || 0,
      to: data.meta.to || 0,
    }
    stats.total_users = data.meta.total
  }
  catch (e: any) {
    const err = apiError.parse(e, t('Failed to load users.'))
    toast.add({ title: err.message, color: 'error' })
  }
  finally {
    loading.value = false
  }
}

function onSearch(query: string) {
  searchValue.value = query
  fetchUsers(1)
}

// Verify email
async function handleVerifyEmail(user: any) {
  try {
    await $api(`/admin/users/${user.id}/verify-email`, { method: 'POST' })
    toast.add({ title: t('Email verified.'), color: 'success' })
    fetchUsers(paginationMeta.value.currentPage)

    if (user.id === authStore.user?.id) {
      await fetchMe()
    }
  }
  catch (e: any) {
    const err = apiError.parse(e, t('Failed to verify email.'))
    toast.add({ title: err.message, color: 'error' })
  }
}

// Delete user
async function handleDelete(user: any) {
  const ok = await confirm({
    title: t('Delete user?'),
    description: t('This will permanently delete {email} and all their data.', { email: user.email }),
    confirmLabel: t('Delete'),
    color: 'error',
  })
  if (!ok) return

  try {
    await $api(`/admin/users/${user.id}`, { method: 'DELETE' })
    toast.add({ title: t('User deleted.'), color: 'success' })
    fetchUsers(paginationMeta.value.currentPage)
  }
  catch (e: any) {
    const err = apiError.parse(e, t('Failed to delete user.'))
    toast.add({ title: err.message, color: 'error' })
  }
}

// Reset database
async function handleReset() {
  const ok = await confirm({
    title: t('Reset entire database?'),
    description: t('This will delete ALL data (users, projects, audits, pages, teams) except admin users. This action cannot be undone.'),
    confirmLabel: t('Yes, reset everything'),
    color: 'error',
    icon: 'i-lucide-alert-triangle',
  })
  if (!ok) return

  resetting.value = true
  try {
    const data = await $api<any>('/admin/database/reset', { method: 'POST' })
    toast.add({
      title: t('Database reset complete. {count} admin users kept.', { count: data.users_kept }),
      color: 'success',
    })
    fetchUsers(1)
  }
  catch (e: any) {
    const err = apiError.parse(e, t('Failed to reset database.'))
    toast.add({ title: err.message, color: 'error' })
  }
  finally {
    resetting.value = false
  }
}

onMounted(() => {
  setNavbar({ title: t('Admin') })
  fetchUsers()
})
</script>
