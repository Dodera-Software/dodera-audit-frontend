<template>
  <div class="relative min-h-screen overflow-x-hidden bg-zinc-800 text-white selection:bg-emerald-500/30">
    <LandingNavbar />
    <LandingHero />
    <LandingFeatures />
    <LandingReportPreview />
    <LandingHowItWorks />
    <LandingCertification />
    <LandingPersonas />
    <LandingPricing />
    <LandingCta />
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
</script>