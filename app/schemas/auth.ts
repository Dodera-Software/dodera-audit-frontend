import { z } from 'zod'

type T = (key: string) => string

export function loginSchema(t: T) {
  return z.object({
    email: z.string().email(t('Enter a valid email address')),
    password: z.string().min(1, t('Password is required')),
  })
}

export function registerSchema(t: T) {
  return z.object({
    name: z.string().min(1, t('Name is required')).max(255),
    email: z.string().email(t('Enter a valid email address')),
    password: z.string().min(8, t('Password must be at least 8 characters')),
    password_confirmation: z.string().min(1, t('Confirm your password')),
    terms: z.boolean().refine(val => val === true, { message: t('You must accept the terms') }),
  }).refine(data => data.password === data.password_confirmation, {
    message: t('Passwords do not match'),
    path: ['password_confirmation'],
  })
}

export function forgotPasswordSchema(t: T) {
  return z.object({
    email: z.string().email(t('Enter a valid email address')),
  })
}

export function resetPasswordSchema(t: T) {
  return z.object({
    email: z.string().email(t('Enter a valid email address')),
    password: z.string().min(8, t('Password must be at least 8 characters')),
    password_confirmation: z.string().min(1, t('Confirm your password')),
  }).refine(data => data.password === data.password_confirmation, {
    message: t('Passwords do not match'),
    path: ['password_confirmation'],
  })
}
