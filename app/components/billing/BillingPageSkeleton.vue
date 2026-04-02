<template>
  <template>
    <UCard class="mb-4">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <USkeleton class="h-3 w-20" />
          <div class="flex items-center gap-2">
            <USkeleton class="h-8 w-24" />
            <USkeleton class="h-5 w-14 rounded-full" />
          </div>
        </div>
        <div class="flex gap-2">
          <USkeleton class="h-8 w-24 rounded-lg" />
          <USkeleton class="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </UCard>

    <UCard class="mb-4">
      <USkeleton class="mb-4 h-4 w-36" />
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-12" />
          </div>
          <USkeleton class="h-2 w-full rounded-full" />
        </div>
        <div class="flex items-center justify-between">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-32" />
        </div>
      </div>
    </UCard>
  </template>
</template>
