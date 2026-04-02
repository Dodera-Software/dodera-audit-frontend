<template>
  <div class="overflow-hidden rounded-xl border border-(--ui-border)">
    <USkeleton class="aspect-[16/9] w-full" />
    <div class="space-y-2 p-4">
      <div class="flex items-center gap-2.5">
        <USkeleton class="h-5 w-5 shrink-0 rounded" />
        <div class="flex-1 space-y-1.5">
          <USkeleton class="h-3.5 w-3/4" />
          <USkeleton class="h-3 w-full" />
        </div>
      </div>
      <div class="flex gap-2 pt-1">
        <USkeleton class="h-4 w-16 rounded-full" />
        <USkeleton class="h-4 w-12 rounded-full" />
      </div>
    </div>
  </div>
</template>
