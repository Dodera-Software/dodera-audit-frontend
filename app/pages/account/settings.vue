<template>
  <ClientOnly>
    <div class="mx-auto max-w-5xl space-y-6">

      <SettingsAppearance />

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <SettingsNotifications />
          <SettingsApiIntegration />
        </div>

        <div class="space-y-6">
          <SettingsPlanCard />
          <SettingsDangerZone />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const { setNavbar } = usePageNavbar()

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const router = useRouter()

onMounted(() => {
  setNavbar({ title: t('Settings'), showBack: true })
})
</script>
