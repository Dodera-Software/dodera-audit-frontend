<template>
  <div class="flex min-h-screen items-center justify-center bg-(--ui-bg)">
    <div class="w-full max-w-md px-4">
      <div class="mb-8 flex justify-center">
        <img src="~/assets/logo/pawbytech-logo.svg" alt="PawByTech" class="h-10 w-auto" />
      </div>
      <UCard>
        <slot />
      </UCard>
    </div>
  </div>
</template>
