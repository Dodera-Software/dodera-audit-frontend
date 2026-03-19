<template>
  <div class="flex min-h-screen items-center justify-center bg-(--ui-bg)">
    <div class="w-full max-w-md px-4">
      <div class="mb-8 text-center">
        <h1 class="font-display text-3xl font-bold text-(--ui-text-highlighted)">
          GhostAudit
        </h1>
      </div>
      <UCard>
        <slot />
      </UCard>
    </div>
  </div>
</template>
