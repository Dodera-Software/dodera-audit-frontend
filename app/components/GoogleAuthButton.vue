<template>
  <button
    type="button"
    class="mx-auto flex w-fit cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    :disabled="loading"
    @click="$emit('click')"
  >
    <img
      :src="lightSrc"
      :alt="alt"
      class="h-10 dark:hidden"
    />
    <img
      :src="darkSrc"
      :alt="alt"
      class="hidden h-10 dark:block"
    />
  </button>
</template>

<script setup lang="ts">
import lightCtn from '~/assets/google/auth/web_mobile_desktop/svg/light/web_light_rd_ctn.svg'
import lightSU from '~/assets/google/auth/web_mobile_desktop/svg/light/web_light_rd_SU.svg'
import darkCtn from '~/assets/google/auth/web_mobile_desktop/svg/dark/web_dark_rd_ctn.svg'
import darkSU from '~/assets/google/auth/web_mobile_desktop/svg/dark/web_dark_rd_SU.svg'

const props = withDefaults(defineProps<{
  action?: 'continue' | 'signup'
  loading?: boolean
}>(), {
  action: 'continue',
  loading: false,
})

defineEmits<{
  click: []
}>()

const lightSrc = computed(() => props.action === 'signup' ? lightSU : lightCtn)
const darkSrc = computed(() => props.action === 'signup' ? darkSU : darkCtn)
const alt = computed(() => props.action === 'signup' ? 'Sign up with Google' : 'Continue with Google')
</script>
