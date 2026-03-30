<template>
  <div class="min-h-screen bg-(--ui-bg)">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 border-b border-(--ui-border) bg-(--ui-bg)/80 backdrop-blur-lg">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NuxtLink to="/" class="font-display text-xl font-bold text-(--ui-text-highlighted)">
          PawByTech
        </NuxtLink>
        <nav class="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" class="text-sm text-(--ui-text-muted) transition hover:text-(--ui-text-highlighted)">
            {{ t('How it works') }}
          </a>
          <a href="#features" class="text-sm text-(--ui-text-muted) transition hover:text-(--ui-text-highlighted)">
            {{ t('Features') }}
          </a>
        </nav>
        <div class="flex items-center gap-3">
          <UButton to="/login" variant="ghost" size="sm">
            {{ t('Sign in') }}
          </UButton>
          <UButton to="/register" size="sm">
            {{ t('Get started') }}
          </UButton>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="mx-auto max-w-6xl px-6 pb-24 pt-20 lg:pt-28">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <!-- Left: Copy -->
        <div>
          <h1 class="font-display text-4xl font-bold leading-tight text-(--ui-text-highlighted) sm:text-5xl lg:text-6xl">
            {{ t('Know what visitors') }}
            <span class="text-(--ui-primary)">{{ t('really think.') }}</span>
          </h1>
          <p class="mt-6 max-w-lg text-lg leading-relaxed text-(--ui-text-muted)">
            {{ t('Paste any URL. Seven AI personas audit your page for clarity, trust, and conversion — then tell you exactly what to fix.') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
            <UButton to="/register" size="xl" trailing-icon="i-lucide-arrow-right">
              {{ t('Start free audit') }}
            </UButton>
            <UButton to="/login" size="xl" variant="outline">
              {{ t('Sign in') }}
            </UButton>
          </div>
          <p class="mt-4 text-sm text-(--ui-text-dimmed)">
            {{ t('No credit card required. Results in under 3 minutes.') }}
          </p>
        </div>

        <!-- Right: Score mockup -->
        <div class="relative">
          <div class="rounded-2xl border border-(--ui-border) bg-(--ui-bg-elevated) p-6 shadow-xl">
            <!-- Mock header -->
            <div class="mb-4 flex items-center gap-2">
              <div class="h-3 w-3 rounded-full bg-red-400" />
              <div class="h-3 w-3 rounded-full bg-yellow-400" />
              <div class="h-3 w-3 rounded-full bg-green-400" />
              <span class="ml-2 font-mono text-xs text-(--ui-text-dimmed)">pawbytech.com/report</span>
            </div>

            <!-- Mock score -->
            <div class="text-center">
              <div class="inline-flex h-28 w-28 items-center justify-center rounded-full border-4 border-(--ui-primary) bg-(--ui-primary)/10">
                <span class="font-display text-4xl font-bold text-(--ui-primary)">78</span>
              </div>
              <p class="mt-2 text-sm font-medium text-(--ui-text-highlighted)">Overall Score</p>
              <p class="text-xs text-green-500">+12 vs previous</p>
            </div>

            <!-- Mock sub-scores -->
            <div class="mt-6 grid grid-cols-5 gap-2">
              <div v-for="(item, i) in mockScores" :key="i" class="rounded-lg bg-(--ui-bg) p-2 text-center">
                <p class="text-xs text-(--ui-text-dimmed)">{{ item.label }}</p>
                <p class="font-display text-lg font-bold" :class="item.color">{{ item.score }}</p>
              </div>
            </div>

            <!-- Mock persona row -->
            <div class="mt-6 flex items-center gap-3">
              <div class="flex-1 rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user-check" class="h-4 w-4 text-green-500" />
                  <span class="text-xs font-medium text-(--ui-text-highlighted)">The Skeptic</span>
                </div>
                <p class="mt-1 text-xs text-green-600">Would convert</p>
              </div>
              <div class="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-user-x" class="h-4 w-4 text-amber-500" />
                  <span class="text-xs font-medium text-(--ui-text-highlighted)">The Impulse Visitor</span>
                </div>
                <p class="mt-1 text-xs text-amber-600">Uncertain</p>
              </div>
            </div>
          </div>

          <!-- Floating badge -->
          <div class="absolute -right-3 -top-3 rounded-full border border-(--ui-border) bg-(--ui-bg-elevated) px-3 py-1.5 shadow-lg">
            <span class="text-xs font-medium text-(--ui-text-highlighted)">AI-powered</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="border-t border-(--ui-border) bg-(--ui-bg-elevated)">
      <div class="mx-auto max-w-6xl px-6 py-24">
        <div class="text-center">
          <h2 class="font-display text-3xl font-bold text-(--ui-text-highlighted) sm:text-4xl">
            {{ t('How it works') }}
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-(--ui-text-muted)">
            {{ t('Three steps to understand how your page performs through the eyes of real visitors.') }}
          </p>
        </div>

        <div class="mt-16 grid gap-8 md:grid-cols-3">
          <div v-for="(step, i) in steps" :key="i" class="relative">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-(--ui-primary) text-sm font-bold text-white">
              {{ i + 1 }}
            </div>
            <h3 class="mt-4 font-display text-lg font-semibold text-(--ui-text-highlighted)">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-(--ui-text-muted)">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="border-t border-(--ui-border)">
      <div class="mx-auto max-w-6xl px-6 py-24">
        <div class="text-center">
          <h2 class="font-display text-3xl font-bold text-(--ui-text-highlighted) sm:text-4xl">
            {{ t('Everything you need to optimize') }}
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-(--ui-text-muted)">
            {{ t('PawByTech goes beyond basic audits. AI agents simulate real visitors and find what analytics miss.') }}
          </p>
        </div>

        <div class="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(feature, i) in features"
            :key="i"
            class="group rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated) p-6 transition hover:border-(--ui-primary)/30 hover:shadow-md"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-(--ui-primary)/10">
              <UIcon :name="feature.icon" class="h-5 w-5 text-(--ui-primary)" />
            </div>
            <h3 class="mt-4 font-display text-base font-semibold text-(--ui-text-highlighted)">
              {{ feature.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-(--ui-text-muted)">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="border-t border-(--ui-border) bg-(--ui-bg-elevated)">
      <div class="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 class="font-display text-3xl font-bold text-(--ui-text-highlighted) sm:text-4xl">
          {{ t('Ready to see what visitors really think?') }}
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-(--ui-text-muted)">
          {{ t('Start your first audit in under a minute. No setup, no code changes, no credit card.') }}
        </p>
        <div class="mt-8 flex justify-center gap-4">
          <UButton to="/register" size="xl" trailing-icon="i-lucide-arrow-right">
            {{ t('Get started free') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-(--ui-border)">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div class="flex items-center gap-2">
          <span class="font-display text-sm font-semibold text-(--ui-text-highlighted)">PawByTech</span>
          <span class="text-sm text-(--ui-text-dimmed)">{{ t('by') }}</span>
          <a
            href="https://doderasoft.com"
            target="_blank"
            rel="noopener"
            class="text-sm font-medium text-(--ui-text-muted) transition hover:text-(--ui-text-highlighted)"
          >
            Dodera Software
          </a>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/login" class="text-sm text-(--ui-text-muted) transition hover:text-(--ui-text-highlighted)">
            {{ t('Sign in') }}
          </NuxtLink>
          <NuxtLink to="/register" class="text-sm text-(--ui-text-muted) transition hover:text-(--ui-text-highlighted)">
            {{ t('Create account') }}
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()

const mockScores = [
  { label: 'Clarity', score: 82, color: 'text-green-500' },
  { label: 'Trust', score: 71, color: 'text-yellow-500' },
  { label: 'Conversion', score: 68, color: 'text-yellow-500' },
  { label: 'Speed', score: 94, color: 'text-green-500' },
  { label: 'Technical', score: 100, color: 'text-green-500' },
]

const steps = computed(() => [
  {
    title: t('Paste your URL'),
    description: t('Enter any page URL. No code snippet, no setup, no waiting for a developer.'),
  },
  {
    title: t('AI agents analyze'),
    description: t('Seven AI personas visit your page — a skeptic, an impulse buyer, a comparison shopper — and score what they see.'),
  },
  {
    title: t('Get your fix list'),
    description: t('Actionable issues ranked by impact, with step-by-step fix instructions and AI suggestions. Track progress on a Kanban board.'),
  },
])

const features = computed(() => [
  {
    icon: 'i-lucide-users',
    title: t('7 AI Persona Agents'),
    description: t('Each persona evaluates your page differently — the skeptic needs proof, the impulse visitor decides in seconds, the comparison shopper weighs alternatives.'),
  },
  {
    icon: 'i-lucide-eye',
    title: t('5-Second Test'),
    description: t('What does a stranger see in the first 5 seconds? Our visual analysis tells you exactly what impression your page makes.'),
  },
  {
    icon: 'i-lucide-target',
    title: t('Conversion scoring'),
    description: t('Not just SEO or speed. We score clarity, trust, and conversion intent — the things that actually make visitors take action.'),
  },
  {
    icon: 'i-lucide-kanban',
    title: t('Kanban issue board'),
    description: t('Every issue lands on a drag-and-drop board. Prioritize, assign status, and track fixes from detection to verification.'),
  },
  {
    icon: 'i-lucide-brain',
    title: t('Project Brain'),
    description: t('The Brain learns across audits. It tracks patterns, detects regressions, and tells a narrative of your page improvement over time.'),
  },
  {
    icon: 'i-lucide-repeat',
    title: t('Re-audit & verify'),
    description: t('Fixed an issue? Run another audit. PawByTech automatically verifies fixes and detects regressions.'),
  },
])
</script>
