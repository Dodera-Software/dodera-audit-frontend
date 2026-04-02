<template>
  <div class="flex flex-col rounded-2xl border border-(--ui-border) p-6">
    <USkeleton class="h-6 w-12" />
    <USkeleton class="mt-1.5 h-3.5 w-32" />
    <div class="my-4 flex items-baseline gap-1">
      <USkeleton class="h-10 w-16" />
      <USkeleton class="h-4 w-16" />
    </div>
    <div class="mb-6 flex-1 space-y-2.5">
      <div v-for="i in 6" :key="i" class="flex items-start gap-2">
        <USkeleton class="mt-0.5 h-4 w-4 shrink-0 rounded" />
        <USkeleton class="h-4 flex-1" :class="i % 3 === 0 ? 'w-3/4' : 'w-full'" />
      </div>
    </div>
    <USkeleton class="h-9 w-full rounded-lg" />
  </div>
</template>
