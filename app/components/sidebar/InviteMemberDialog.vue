<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-md' }">
    <template #content>
      <div class="flex flex-col items-center px-6 py-5">
        <div class="flex h-11 w-11 items-center justify-center rounded-full bg-(--ui-primary)/10">
          <UIcon name="i-lucide-user-plus" class="h-5 w-5 text-(--ui-primary)" />
        </div>

        <h2 class="mt-3 text-base font-semibold text-(--ui-text-highlighted)">{{ t('Invite a team member') }}</h2>
        <p class="mt-1 text-center text-sm text-(--ui-text-muted)">
          {{ t('They\'ll receive an email with a link to join your team.') }}
        </p>

        <div class="mt-4 flex w-full gap-2">
          <UInput
            v-model="email"
            type="email"
            size="lg"
            placeholder="colleague@example.com"
            :disabled="loading"
            class="flex-1"
            @keyup.enter="handleInvite"
          />
          <UButton
            size="lg"
            :loading="loading"
            :disabled="!email.trim()"
            icon="i-lucide-send"
            @click="handleInvite"
          >
            {{ t('Invite') }}
          </UButton>
        </div>

        <p v-if="errorMsg" class="mt-2 w-full text-xs text-red-500">{{ errorMsg }}</p>

        <div v-if="sentEmails.length" class="mt-3 w-full space-y-1.5">
          <div
            v-for="sentEmail in sentEmails"
            :key="sentEmail"
            class="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            <UIcon name="i-lucide-check-circle" class="h-4 w-4 shrink-0" />
            <span>{{ t('Invitation sent to {email}', { email: sentEmail }) }}</span>
          </div>
        </div>

        <p class="mt-4 text-xs text-(--ui-text-dimmed)">
          {{ t('Team members share your plan. Manage seats in') }}
          {{ ' ' }}
          <NuxtLink to="/account/team" class="underline hover:text-(--ui-text-muted)" @click="open = false">{{ t('team settings') }}</NuxtLink>.
        </p>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ teamId: string }>()

const { t } = useI18n()
const { inviteMember } = useTeam()

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const sentEmails = ref<string[]>([])

watch(open, (val) => {
  if (val) {
    email.value = ''
    errorMsg.value = ''
    sentEmails.value = []
  }
})

async function handleInvite() {
  const trimmed = email.value.trim()
  if (!trimmed) return
  loading.value = true
  errorMsg.value = ''
  try {
    await inviteMember(props.teamId, trimmed)
    sentEmails.value.push(trimmed)
    email.value = ''
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    errorMsg.value = err?.data?.message ?? t('Failed to send invitation.')
  }
  finally {
    loading.value = false
  }
}
</script>
