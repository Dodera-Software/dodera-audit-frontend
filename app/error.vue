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

interface ErrorMessages {
  title: string
  description: string
}

const errorMap = computed<Record<number, ErrorMessages>>(() => ({
  404: {
    title: t('Page not found'),
    description: t("The page you're looking for doesn't exist or has been moved."),
  },
  403: {
    title: t('Access denied'),
    description: t("You don't have permission to view this page."),
  },
  500: {
    title: t('Something went wrong'),
    description: t("We're having trouble on our end. Please try again in a moment."),
  },
}))

const fallback = computed<ErrorMessages>(() => ({
  title: t('An error occurred'),
  description: t('Something unexpected happened. Try going back or returning to the dashboard.'),
}))

const title = computed(() => (errorMap.value[props.error.statusCode] ?? fallback.value).title)
const description = computed(() => (errorMap.value[props.error.statusCode] ?? fallback.value).description)
</script>
