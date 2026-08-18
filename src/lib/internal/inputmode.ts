import { isPatternToken, type CustomPatterns } from './cursor.js'

export type InputMode =
  'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'

export function inferInputMode(
  pattern: string,
  customPatterns?: CustomPatterns
): InputMode {
  if (!pattern) return 'text'

  let hasDigitToken = false
  let hasNonDigitToken = false
  let hasLiteral = false

  for (const char of pattern) {
    if (char === '#') {
      hasDigitToken = true
    } else if (char === 'A' || char === '*') {
      hasNonDigitToken = true
    } else if (isPatternToken(char, customPatterns)) {
      // Custom token — treat as non-digit (user-defined alphabet).
      hasNonDigitToken = true
    } else {
      hasLiteral = true
    }
  }

  if (hasNonDigitToken) return 'text'
  if (hasDigitToken && hasLiteral) return 'tel'
  if (hasDigitToken) return 'numeric'
  return 'text'
}
