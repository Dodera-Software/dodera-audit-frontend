<template>
  <div class="overflow-hidden rounded-xl border border-(--ui-border) p-5">
    <div class="flex items-center gap-3">
      <USkeleton class="h-10 w-10 shrink-0 rounded-lg" />
      <div class="flex-1 space-y-1.5">
        <USkeleton class="h-3.5 w-1/2" />
        <USkeleton class="h-3 w-16" />
      </div>
    </div>
    <div class="mt-4 space-y-2">
      <USkeleton v-for="i in 3" :key="i" class="h-6 w-full rounded-md" />
    </div>
    <div class="mt-3 flex items-center justify-between">
      <USkeleton class="h-3 w-20" />
      <USkeleton class="h-3.5 w-3.5 rounded" />
    </div>
  </div>
</template>
