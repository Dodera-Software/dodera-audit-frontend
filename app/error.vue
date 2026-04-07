<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-(--ui-bg) px-4">
    <NuxtLink to="/dashboard" class="mb-10 hover:opacity-80">
      <AppLogo class="h-20 w-auto" />
    </NuxtLink>

    <div class="flex flex-col items-center gap-4 text-center">
      <span class="text-8xl font-bold text-(--ui-primary) leading-none tracking-tight">
        {{ error.statusCode }}
      </span>

      <div class="flex flex-col gap-1.5">
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">
          {{ title }}
        </h1>
        <p class="max-w-sm text-sm text-(--ui-text-muted)">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()

const { t } = useI18n()

const title = computed(() => {
  if (props.error.statusCode === 404) return t('Page not found')
  if (props.error.statusCode === 403) return t('Access denied')
  if (props.error.statusCode === 500) return t('Something went wrong')
  return t('An error occurred')
})

const description = computed(() => {
  if (props.error.statusCode === 404) return t("The page you're looking for doesn't exist or has been moved.")
  if (props.error.statusCode === 403) return t("You don't have permission to view this page.")
  if (props.error.statusCode === 500) return t("We're having trouble on our end. Please try again in a moment.")
  return t('Something unexpected happened. Try going back or returning to the dashboard.')
})
</script>
