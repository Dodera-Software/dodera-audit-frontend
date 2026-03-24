import { z } from 'zod'

type T = (key: string) => string

export function createProjectSchema(t: T) {
  return z.object({
    name: z.string().min(1, t('Project name is required')).max(255),
    url: z.string().url(t('Enter a valid URL')),
    site_type: z.string().min(1, t('Select a site type')),
    conversion_goal: z.string().min(1, t('Conversion goal is required')).max(255),
    target_audience_description: z.string().max(1000).optional().or(z.literal('')),
  })
}
