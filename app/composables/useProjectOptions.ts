export function useProjectOptions() {
  const { t } = useI18n()

  const siteTypes = computed(() => [
    { label: t('SaaS'), value: 'saas' },
    { label: t('E-commerce'), value: 'ecommerce' },
    { label: t('Agency / Portfolio'), value: 'agency' },
    { label: t('Lead Generation'), value: 'lead_gen' },
    { label: t('Local Business'), value: 'local' },
    { label: t('Blog / Media'), value: 'blog' },
    { label: t('Web Application'), value: 'webapp' },
    { label: t('Other'), value: 'other' },
  ])

  const pageTypes = computed(() => [
    { label: t('Homepage'), value: 'homepage' },
    { label: t('About'), value: 'about' },
    { label: t('Pricing'), value: 'pricing' },
    { label: t('Product'), value: 'product' },
    { label: t('Service'), value: 'service' },
    { label: t('Landing Page'), value: 'landing' },
    { label: t('Contact'), value: 'contact' },
    { label: t('Blog Post'), value: 'blog_post' },
    { label: t('FAQ'), value: 'faq' },
    { label: t('Checkout'), value: 'checkout' },
    { label: t('Portfolio'), value: 'portfolio' },
    { label: t('Other'), value: 'other' },
  ])

  const conversionGoals = computed(() => [
    { label: t('Sign up for free trial'), value: 'Sign up for free trial' },
    { label: t('Purchase product'), value: 'Purchase product' },
    { label: t('Submit contact form'), value: 'Submit contact form' },
    { label: t('Book a demo'), value: 'Book a demo' },
    { label: t('Subscribe to newsletter'), value: 'Subscribe to newsletter' },
    { label: t('Phone call'), value: 'Phone call' },
    { label: t('Content engagement'), value: 'Content engagement' },
  ])

  function siteTypeLabel(value: string): string {
    return siteTypes.value.find(st => st.value === value)?.label ?? value
  }

  function pageTypeLabel(value: string): string {
    return pageTypes.value.find(pt => pt.value === value)?.label ?? value
  }

  return { siteTypes, pageTypes, conversionGoals, siteTypeLabel, pageTypeLabel }
}
