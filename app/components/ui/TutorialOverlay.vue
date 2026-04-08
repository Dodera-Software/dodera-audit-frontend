<template>
  <Teleport to="body">
    <Transition name="tutorial-overlay" appear>
      <div
        v-if="showWelcome"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/75 px-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        :aria-label="t('Welcome tour')"
        @click="tutorialStore.dismiss()"
      >
        <Transition name="tutorial-card" appear>
          <div
            v-if="showWelcome"
            class="w-full max-w-xl overflow-hidden rounded-2xl border border-(--ui-border) bg-(--ui-bg) shadow-2xl"
            @click.stop
          >
            <!-- Emerald accent stripe -->
            <div class="pbt-welcome-stripe h-[3px] w-full" />

            <!-- Animated header -->
            <div class="relative overflow-hidden bg-(--ui-bg-accented) px-10 pb-8 pt-10 text-center">
              <div class="absolute inset-0 opacity-60">
                <div class="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-(--ui-primary)/25 blur-3xl" />
                <div class="absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-violet-500/25 blur-3xl" />
                <div class="absolute bottom-4 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-2xl" />
              </div>

              <!-- Dog logo -->
              <div class="relative mx-auto mb-1 flex h-28 w-28 items-center justify-center rounded-full bg-(--ui-bg) shadow-lg ring-4 ring-(--ui-primary)/20">
                <AppLogo class="h-24 w-24 object-contain drop-shadow-md" />
              </div>

              <h2 class="relative mt-4 text-3xl font-bold tracking-tight text-(--ui-text-highlighted)">
                {{ t('Welcome to PawByTech!') }}
              </h2>
              <p class="relative mt-2 text-base text-(--ui-text-muted)">
                {{ t("You're one quick tour away from your first audit.") }}
              </p>
            </div>

            <!-- Feature list -->
            <ul class="space-y-4 px-10 py-7">
              <li
                v-for="feature in features"
                :key="feature.icon"
                class="flex items-start gap-4"
              >
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--ui-primary)/10">
                  <UIcon :name="feature.icon" class="h-5 w-5 text-(--ui-primary)" />
                </div>
                <div class="min-w-0">
                  <p class="text-base font-semibold text-(--ui-text-highlighted)">{{ feature.title }}</p>
                  <p class="mt-0.5 text-sm leading-relaxed text-(--ui-text-muted)">{{ feature.description }}</p>
                </div>
              </li>
            </ul>

            <!-- Actions -->
            <div class="flex flex-col gap-3 border-t border-(--ui-border) px-10 py-6">
              <UButton
                block
                size="xl"
                class="tour-start-btn"
                :ui="{ base: 'justify-center' }"
                @click="startTour()"
              >
                {{ t('Take the quick tour') }}
                <template #trailing>
                  <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
                </template>
              </UButton>
              <UButton
                block
                variant="ghost"
                color="neutral"
                size="md"
                :ui="{ base: 'justify-center' }"
                @click="tutorialStore.dismiss()"
              >
                {{ t('Skip for now') }}
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTutorialStore } from '~/stores/tutorial'

const { t } = useI18n()
const tutorialStore = useTutorialStore()
const { showWelcome } = storeToRefs(tutorialStore)
const { startTour } = useTutorial()

interface Feature {
  icon: string
  title: string
  description: string
}

const features = computed<Feature[]>(() => [
  {
    icon: 'i-lucide-folder',
    title: t('Projects group your pages'),
    description: t('Create a project for each website. Projects hold all the pages you want to audit.'),
  },
  {
    icon: 'i-lucide-scan-search',
    title: t('Audit any page in under 3 minutes'),
    description: t('Add a URL, run an audit, and get an AI score across clarity, trust, conversion, and more.'),
  },
  {
    icon: 'i-lucide-kanban',
    title: t('Fix issues from your board'),
    description: t('Every audit generates a prioritised issue list. Drag cards, assign status, and track fixes.'),
  },
])
</script>

<style scoped>
/* Primary CTA — emerald gradient matching the driver.js popovers */
:deep(.tour-start-btn) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  box-shadow: 0 1px 3px rgba(5, 150, 105, 0.3), 0 6px 14px rgba(16, 185, 129, 0.22);
  border: none !important;
  transition: all 0.15s ease !important;
}

:deep(.tour-start-btn:hover) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.4), 0 8px 18px rgba(16, 185, 129, 0.28) !important;
  transform: translateY(-1px);
}

:deep(.tour-start-btn:active) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(5, 150, 105, 0.3) !important;
}

.tutorial-overlay-enter-active,
.tutorial-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.tutorial-overlay-enter-from,
.tutorial-overlay-leave-to {
  opacity: 0;
}

.tutorial-card-enter-active {
  transition:
    opacity 0.3s ease 0.05s,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s;
}

.tutorial-card-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.tutorial-card-enter-from,
.tutorial-card-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
</style>
