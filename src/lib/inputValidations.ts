import { validateBrazilianCPFDigit } from './helpers.js'
import type { MaskPatternKeys } from './maskPatterns.js'

/**
 * Functions:
 * A validation function should take a string as argument
 * and return a boolean indicating whether the input is valid.
 *
 * (value: string) => boolean
 */
export type InputValidator = (value: string) => boolean

export type AllowedInputValidators = {
  [k in MaskPatternKeys]: InputValidator
}
export const InputValidators: Partial<AllowedInputValidators> = {
  BRAZILIAN_CPF: (value: string) => {
    if (!value) return false

    const cleanCPF = value.replace(/\D/g, '')

    if (cleanCPF.length !== 11) return false

    if (/^(\d)\1+$/.test(cleanCPF)) return false

    if (!validateBrazilianCPFDigit(cleanCPF, 10)) return false // 1st Check Digit
    if (!validateBrazilianCPFDigit(cleanCPF, 11)) return false // 2nd Check Digit

    return true
  }
} as const

export type InputValidatorsKeys = keyof typeof InputValidators
