<template>
  <div class="flex flex-col gap-6">
    <AuditHistoryHeroSkeleton />

    <!-- List header -->
    <div class="flex items-center justify-between">
      <USkeleton class="h-4 w-24" />
      <USkeleton class="h-7 w-32 rounded-lg" />
    </div>

    <!-- Audit rows skeleton -->
    <div class="space-y-1.5">
      <div
        v-for="i in 6"
        :key="i"
        class="flex items-center gap-4 rounded-xl border border-(--ui-border) px-4 py-3.5"
      >
        <USkeleton class="h-10 w-10 shrink-0 rounded-full" />
        <div class="flex-1 space-y-1.5">
          <div class="flex items-center gap-2">
            <USkeleton class="h-3.5 w-36" />
            <USkeleton class="h-3 w-20" />
          </div>
          <div class="flex gap-3">
            <USkeleton class="h-3 w-14" />
            <USkeleton class="h-3 w-14" />
          </div>
        </div>
        <USkeleton class="h-4 w-4 rounded" />
      </div>
    </div>
  </div>
</template>
