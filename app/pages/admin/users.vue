<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <template v-if="table.loading.value">
        <AdminTableSkeleton :rows="8" />
      </template>

      <BaseDataTable
        v-else
        :row-data="table.rows.value"
        :column-defs="columnDefs"
        :clickable="false"
        :pagination-meta="table.paginationMeta.value"
        :row-actions="getRowActions"
        :hide-search="false"
        :search-placeholder="t('Search by name or email...')"
        :show-refresh="true"
        :loading="table.tableLoading.value"
        :default-col-def="{ sortable: true, filter: false, resizable: true }"
        @grid-ready="onGridReady"
        @page-change="table.onPageChange"
        @search="table.onSearch"
        @refresh="table.onRefresh"
      >
        <template #title>
          <h2 class="text-sm font-semibold text-(--ui-text-highlighted)">{{ t('All Users') }}</h2>
        </template>
        <template #actions>
          <UButton icon="i-lucide-user-plus" size="sm" @click="showCreateModal = true">
            {{ t('Create user') }}
          </UButton>
        </template>
      </BaseDataTable>

      <!-- Create user modal -->
      <UModal v-model:open="showCreateModal">
        <template #content>
          <div class="space-y-4 p-6">
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
              <UButton variant="ghost" color="neutral" @click="showCreateModal = false">{{ t('Cancel') }}</UButton>
              <UButton :loading="creating" :disabled="!createForm.name || !createForm.email || !createForm.password" @click="handleCreate">
                {{ t('Create') }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community'
import type { RowAction } from '~/components/BaseDataTable.vue'
import { UserRole, isSuperAdmin as checkSuperAdmin } from '~/constants/roles'

definePageMeta({ middleware: ['auth', 'admin'] })

const { t } = useI18n()
const { $api } = useApi()
const toast = useToast()
const { confirm } = useConfirm()
const authStore = useAuthStore()
const { fetchMe } = useAuth()
const apiError = useApiError()
const { setNavbar } = usePageNavbar()

onMounted(() => {
  setNavbar({ title: t('Users') })
})

let gridApi: GridApi | null = null

const table = useServerDataTable({
  endpoint: '/admin/users',
  perPage: 25,
  errorMessage: t('Failed to load users.'),
})

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
    Object.assign(createForm, { name: '', email: '', password: '', plan: 'free' })
    table.fetch(1)
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to create user.')).message, color: 'error' })
  }
  finally {
    creating.value = false
  }
}

const isSuperAdmin = computed(() => checkSuperAdmin(authStore.user?.role))

function canModifyUser(row: any): boolean {
  // Super admin can edit themselves
  if (row.role === UserRole.SuperAdmin && row.id === authStore.user?.id) return true
  // Nobody else can edit super admins
  if (row.role === UserRole.SuperAdmin) return false
  // Only super admin can edit other admins
  if (row.role === UserRole.Admin && !isSuperAdmin.value) return false
  return true
}

function getRowActions(row: any): RowAction[] {
  const actions: RowAction[] = []
  if (!row.email_verified_at && canModifyUser(row)) {
    actions.push({ label: t('Verify email'), icon: 'i-lucide-mail-check', color: 'success', onSelect: () => handleVerifyEmail(row) })
  }
  // Cannot delete yourself
  if (canModifyUser(row) && row.id !== authStore.user?.id) {
    actions.push({ label: t('Delete user'), icon: 'i-lucide-trash-2', color: 'error', onSelect: () => handleDelete(row) })
  }
  return actions
}

const planOptions = ['free', 'pro', 'max']
const isEditable = (p: any) => canModifyUser(p.data)
const columnDefs = computed<ColDef[]>(() => [
  { headerName: t('Name'), field: 'name', editable: isEditable, flex: 1, minWidth: 150 },
  { headerName: t('Email'), field: 'email', editable: isEditable, flex: 1.5, minWidth: 200 },
  {
    headerName: t('Plan'), field: 'plan', editable: isEditable, width: 100,
    cellEditor: 'agSelectCellEditor', cellEditorParams: { values: planOptions },
    cellClass: (p: any) => p.value === 'max' ? 'text-purple-600 font-semibold' : p.value === 'pro' ? 'text-blue-600 font-semibold' : 'text-(--ui-text-muted)',
  },
  {
    headerName: t('Auth'), field: 'auth_provider', editable: false, width: 90,
    valueFormatter: (p: any) => p.value === 'google' ? 'Google' : 'Email',
    cellClass: (p: any) => p.value === 'google' ? 'text-blue-600' : '',
  },
  {
    headerName: t('Role'), field: 'role', width: 110,
    editable: (p: any) => isSuperAdmin.value && p.data?.role !== UserRole.SuperAdmin,
    cellEditor: 'agSelectCellEditor', cellEditorParams: { values: [UserRole.User, UserRole.Admin] },
    valueFormatter: (p: any) => p.value ? p.value.replace(/_/g, ' ') : 'user',
    cellClass: (p: any) => p.value === UserRole.SuperAdmin ? 'text-amber-600 font-semibold' : p.value === UserRole.Admin ? 'text-purple-600 font-semibold' : '',
  },
  { headerName: t('Extra Seats'), field: 'extra_seats', editable: isEditable, width: 120, cellDataType: 'number' },
  {
    headerName: t('Verified'), field: 'email_verified_at', editable: false, width: 100,
    valueFormatter: (p: any) => p.value ? 'Yes' : 'No',
    cellClass: (p: any) => p.value ? 'text-emerald-600' : 'text-red-500',
  },
  {
    headerName: t('Created'), field: 'created_at', editable: false, width: 130,
    valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : '',
  },
])

function onGridReady(event: GridReadyEvent) {
  gridApi = event.api
  gridApi.addEventListener('cellValueChanged', async (e: CellValueChangedEvent) => {
    const { data, colDef, newValue, oldValue } = e
    if (newValue === oldValue) return
    const field = colDef.field!
    try {
      await $api(`/admin/users/${data.id}`, { method: 'PATCH', body: { [field]: newValue } })
      toast.add({ title: t('User updated.'), color: 'success' })
      if (data.id === authStore.user?.id) await fetchMe()
    }
    catch (err: any) {
      data[field] = oldValue
      gridApi?.refreshCells({ rowNodes: [e.node], force: true })
      toast.add({ title: apiError.parse(err, t('Failed to update user.')).message, color: 'error' })
    }
  })
}

async function handleVerifyEmail(user: any) {
  try {
    await $api(`/admin/users/${user.id}/verify-email`, { method: 'POST' })
    toast.add({ title: t('Email verified.'), color: 'success' })
    table.onRefresh()
    if (user.id === authStore.user?.id) await fetchMe()
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to verify email.')).message, color: 'error' })
  }
}

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
    table.onRefresh()
  }
  catch (e: any) {
    toast.add({ title: apiError.parse(e, t('Failed to delete user.')).message, color: 'error' })
  }
}
</script>
