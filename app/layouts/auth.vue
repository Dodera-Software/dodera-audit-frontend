<template>
  <div class="flex min-h-screen">
    <AuthBrandPanel />

    <!-- Right form panel -->
    <div class="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-(--ui-bg)">
      <!-- Mobile logo -->
      <div class="mb-6 flex justify-center lg:hidden">
        <img src="~/assets/logo/pawbytech-logo.png" alt="PawByTech" class="h-14 w-auto" />
      </div>

      <div class="w-full max-w-md px-6 py-10">
        <slot />
      </div>
    </div>
  </div>
</template>
