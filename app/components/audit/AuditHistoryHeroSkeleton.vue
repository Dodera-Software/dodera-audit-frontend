<template>
  <div class="overflow-hidden rounded-2xl border border-(--ui-border)">
    <div class="p-6">
      <div class="flex flex-col gap-6 sm:flex-row">
        <!-- Left: score + stats -->
        <div class="flex-1 space-y-5">
          <USkeleton class="h-3 w-24" />
          <div class="flex items-end gap-3">
            <USkeleton class="h-20 w-28" />
            <div class="mb-2 space-y-1.5">
              <USkeleton class="h-3.5 w-8" />
              <USkeleton class="h-3.5 w-16" />
            </div>
          </div>
          <div class="flex gap-6">
            <div class="space-y-1">
              <USkeleton class="h-3 w-14" />
              <USkeleton class="h-5 w-10" />
            </div>
            <div class="space-y-1">
              <USkeleton class="h-3 w-14" />
              <USkeleton class="h-5 w-10" />
            </div>
            <div class="space-y-1">
              <USkeleton class="h-3 w-14" />
              <USkeleton class="h-5 w-10" />
            </div>
          </div>
          <USkeleton class="h-10 w-44 rounded-lg" />
        </div>
        <!-- Right: chart placeholder -->
        <USkeleton class="h-32 w-full rounded-lg sm:w-64" />
      </div>
    </div>
    <!-- Bottom strip -->
    <div class="flex items-center justify-between border-t border-(--ui-border) px-6 py-3">
      <USkeleton class="h-3 w-48" />
      <USkeleton class="h-10 w-32 rounded-lg" />
    </div>
  </div>
</template>
