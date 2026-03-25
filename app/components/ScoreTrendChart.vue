<template>
  <div v-if="data.length >= 2">
    <BaseLineChart
      :labels="labels"
      :values="values"
      :height="height"
      :clickable="clickable"
      color="emerald"
      @point-click="(i: number) => emit('pointClick', i)"
    />
  </div>
  <p v-else class="py-4 text-center text-xs text-(--ui-text-muted)">
    {{ t('Not enough data for a trend chart. Run more audits.') }}
  </p>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: Array<{ overall_score: number, created_at: string }>
  height?: number
  clickable?: boolean
}>(), {
  height: 140,
  clickable: false,
})

const emit = defineEmits<{
  pointClick: [index: number]
}>()

const { t } = useI18n()
const { formatDate } = useFormatters()

const labels = computed(() => props.data.map(d => formatDate(d.created_at)))
const values = computed(() => props.data.map(d => d.overall_score))
</script>
