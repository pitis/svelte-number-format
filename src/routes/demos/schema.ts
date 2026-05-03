import { z } from 'zod/v3'

/**
 * Shared schema used across all three form-library demos.
 * NumericFormat emits a number; PatternFormat emits a string of raw digits.
 */
export const demoSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Required' })
    .min(0, 'Must be ≥ 0')
    .max(1_000_000, 'Must be ≤ 1,000,000'),
  phone: z
    .string({ required_error: 'Required' })
    .regex(/^\d{10}$/, 'Must be exactly 10 digits')
})

export type DemoSchema = z.infer<typeof demoSchema>

export const demoDefaults: DemoSchema = {
  amount: 0,
  phone: ''
}
