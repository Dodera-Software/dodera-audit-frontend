export function useProjectOptions() {
  const { t } = useI18n()

  const siteTypes = [
    { label: t('SaaS Landing Page'), value: 'saas' },
    { label: t('E-commerce Store'), value: 'ecommerce' },
    { label: t('Agency / Portfolio'), value: 'agency' },
    { label: t('Lead Generation'), value: 'lead_gen' },
    { label: t('Local Business'), value: 'local' },
    { label: t('Blog / Media'), value: 'blog' },
    { label: t('Web Application'), value: 'webapp' },
    { label: t('Other'), value: 'other' },
  ]

  const conversionGoals = [
    { label: t('Sign up for free trial'), value: 'Sign up for free trial' },
    { label: t('Purchase product'), value: 'Purchase product' },
    { label: t('Submit contact form'), value: 'Submit contact form' },
    { label: t('Book a demo'), value: 'Book a demo' },
    { label: t('Subscribe to newsletter'), value: 'Subscribe to newsletter' },
    { label: t('Phone call'), value: 'Phone call' },
    { label: t('Content engagement'), value: 'Content engagement' },
  ]

  const siteTypeLabelMap = Object.fromEntries(siteTypes.map(st => [st.value, st.label]))

  function siteTypeLabel(value: string): string {
    return siteTypeLabelMap[value] ?? value
  }

  return { siteTypes, conversionGoals, siteTypeLabel }
}
