<template>
  <div class="flex min-h-screen bg-surface-950">
    <!-- Sidebar -->
    <aside class="hidden w-64 flex-shrink-0 border-r border-surface-800 bg-surface-900 lg:block">
      <div class="flex h-16 items-center px-6">
        <h1 class="font-display text-xl font-bold text-white">
          GhostAudit
        </h1>
      </div>
      <nav class="mt-4 px-3">
        <slot name="sidebar" />
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col">
      <!-- Topbar -->
      <header class="flex h-16 items-center justify-between border-b border-surface-800 bg-surface-900 px-6">
        <div />
        <div class="flex items-center gap-4">
          <slot name="topbar" />
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
