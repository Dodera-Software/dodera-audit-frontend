<template>
  <ClientOnly>
    <div class="mx-auto max-w-5xl space-y-6">

      <ProfileHero />

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <ProfilePersonalForm />
          <ProfilePasswordForm />
        </div>

        <div class="space-y-6">
          <ProfilePlanCard />
          <ProfileAccountDetails />
          <ProfileDangerZone />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { setNavbar } = usePageNavbar()

onMounted(() => {
  setNavbar({ title: t('Profile'), showBack: true })
})

</script>