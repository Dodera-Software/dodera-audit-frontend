<template>
  <img
    src="~/assets/logo/pawbytech-certified.png"
    :alt="t('PawByTech Certified')"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const { t } = useI18n()
</script>
