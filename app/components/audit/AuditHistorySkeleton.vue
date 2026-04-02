<template>
  <div>
    <USkeleton class="h-7 w-40" />

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <UCard v-for="i in 2" :key="i">
        <USkeleton class="h-3.5 w-24" />
        <USkeleton class="mt-2 h-10 w-16" />
        <USkeleton class="mt-1 h-3 w-12" />
      </UCard>
    </div>

    <UCard class="mt-6">
      <USkeleton class="mb-4 h-4 w-24" />
      <USkeleton class="h-48 w-full rounded-lg" />
    </UCard>

    <div class="mt-6 space-y-3">
      <UCard v-for="i in 5" :key="i">
        <div class="flex items-center gap-4">
          <USkeleton class="h-12 w-12 shrink-0 rounded-full" />
          <div class="flex-1 space-y-1.5">
            <USkeleton class="h-3.5 w-32" />
            <USkeleton class="h-3 w-24" />
          </div>
          <USkeleton class="h-4 w-4 rounded" />
        </div>
      </UCard>
    </div>
  </div>
</template>
