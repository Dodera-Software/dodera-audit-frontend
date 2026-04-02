<template>
  <div>
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <USkeleton class="h-8 w-36" />
      <div class="flex items-center gap-3">
        <USkeleton v-for="i in 3" :key="i" class="h-8 w-28 rounded-lg" />
        <USkeleton class="h-9 w-24 rounded-lg" />
      </div>
    </div>

    <UCard>
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-2">
          <USkeleton class="h-3.5 w-24" />
          <USkeleton class="h-16 w-24" />
        </div>
        <div class="grid flex-1 grid-cols-5 gap-3">
          <div v-for="i in 5" :key="i" class="flex flex-col items-center gap-2">
            <USkeleton class="h-12 w-12 rounded-full" />
            <USkeleton class="h-3 w-16" />
          </div>
        </div>
      </div>
      <USkeleton class="mt-4 h-32 w-full rounded-lg" />
    </UCard>

    <div class="mt-12 space-y-3">
      <USkeleton class="mb-4 h-5 w-32" />
      <UCard v-for="i in 4" :key="i">
        <div class="flex items-start gap-3">
          <USkeleton class="h-5 w-5 shrink-0 rounded" />
          <div class="flex-1 space-y-1.5">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-1/2" />
          </div>
          <USkeleton class="h-5 w-16 rounded-full" />
        </div>
      </UCard>
    </div>
  </div>
</template>
