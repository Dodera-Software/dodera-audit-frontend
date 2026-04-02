<template>
  <div>
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3">
        <USkeleton class="h-9 w-9 shrink-0 rounded-lg" />
        <div class="space-y-1.5">
          <USkeleton class="h-5 w-48" />
          <USkeleton class="h-3.5 w-64" />
        </div>
      </div>
      <USkeleton class="h-9 w-32 rounded-lg" />
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <UCard>
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <USkeleton class="h-3 w-20" />
              <USkeleton class="h-10 w-16" />
            </div>
            <USkeleton class="h-8 w-36 rounded-lg" />
          </div>
          <USkeleton class="mt-4 h-40 w-full rounded-lg" />
        </UCard>

        <div class="grid gap-4 sm:grid-cols-2">
          <UCard v-for="i in 2" :key="i">
            <div class="flex items-center gap-3">
              <USkeleton class="h-9 w-9 shrink-0 rounded-lg" />
              <div class="flex-1 space-y-1.5">
                <USkeleton class="h-3.5 w-28" />
                <USkeleton class="h-3 w-16" />
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div class="space-y-4">
        <UCard v-for="i in 2" :key="i">
          <USkeleton class="mb-3 h-4 w-20" />
          <div class="space-y-2">
            <USkeleton v-for="j in 3" :key="j" class="h-3.5 w-full" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
