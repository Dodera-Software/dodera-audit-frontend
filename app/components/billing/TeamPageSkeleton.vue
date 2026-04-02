<template>
  <template>
    <UCard class="mb-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <USkeleton class="h-10 w-10 shrink-0 rounded-xl" />
          <div class="space-y-1.5">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-20" />
          </div>
        </div>
        <USkeleton class="h-7 w-14 rounded-lg" />
      </div>
    </UCard>

    <UCard class="mb-4">
      <USkeleton class="mb-4 h-4 w-24" />
      <div class="space-y-2">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5">
          <div class="flex items-center gap-2.5">
            <USkeleton class="h-7 w-7 shrink-0 rounded-full" />
            <div class="space-y-1">
              <USkeleton class="h-3.5 w-28" />
              <USkeleton class="h-3 w-36" />
            </div>
          </div>
          <USkeleton class="h-6 w-16 rounded-lg" />
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-3">
        <USkeleton class="h-4 w-28" />
        <div class="flex gap-2">
          <USkeleton class="h-9 flex-1 rounded-lg" />
          <USkeleton class="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </UCard>
  </template>
</template>
