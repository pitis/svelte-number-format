export const PATTERN_TOKENS = {
  digit: '#',
  letter: 'A',
  alphanumeric: '*'
} as const

export type PatternToken = (typeof PATTERN_TOKENS)[keyof typeof PATTERN_TOKENS]

export type CustomPatterns = Record<string, RegExp>

const BUILTIN_TOKENS = new Set<string>([
  PATTERN_TOKENS.digit,
  PATTERN_TOKENS.letter,
  PATTERN_TOKENS.alphanumeric
])

export function isBuiltinToken(char: string): char is PatternToken {
  return BUILTIN_TOKENS.has(char)
}

export function isPatternToken(
  char: string,
  customPatterns?: CustomPatterns
): boolean {
  if (isBuiltinToken(char)) return true
  if (
    customPatterns &&
    Object.prototype.hasOwnProperty.call(customPatterns, char)
  ) {
    return true
  }
  return false
}

export function isValidChar(
  char: string,
  token: string,
  customPatterns?: CustomPatterns
): boolean {
  switch (token) {
    case '#':
      return /\d/.test(char)
    case 'A':
      return /[a-zA-Z]/.test(char)
    case '*':
      return /[a-zA-Z0-9]/.test(char)
    default: {
      const custom = customPatterns?.[token]
      if (custom) return custom.test(char)
      return char === token
    }
  }
}

export interface MaskResult {
  masked: string
  raw: string
}

export function applyMask(
  inputValue: string,
  pattern: string,
  customPatterns?: CustomPatterns
): MaskResult {
  if (!pattern) {
    return { masked: inputValue, raw: inputValue }
  }

  let raw = ''
  let masked = ''
  let valueIndex = 0
  let maskIndex = 0

  while (maskIndex < pattern.length && valueIndex < inputValue.length) {
    const maskChar = pattern[maskIndex]
    const inputChar = inputValue[valueIndex]

    if (isPatternToken(maskChar, customPatterns)) {
      if (isValidChar(inputChar, maskChar, customPatterns)) {
        masked += inputChar
        raw += inputChar
        maskIndex++
        valueIndex++
      } else {
        valueIndex++
      }
    } else {
      masked += maskChar
      maskIndex++

      if (inputChar === maskChar) {
        valueIndex++
      }
    }
  }

  return { masked, raw }
}

export function calculateCursorPosition(
  oldCursorPos: number,
  oldValue: string,
  newValue: string,
  pattern: string,
  customPatterns?: CustomPatterns
): number {
  let rawCharsBeforeCursor = 0
  let oldPos = 0
  let patternPos = 0

  while (
    oldPos < oldCursorPos &&
    oldPos < oldValue.length &&
    patternPos < pattern.length
  ) {
    const patternChar = pattern[patternPos]
    const oldChar = oldValue[oldPos]

    if (isPatternToken(patternChar, customPatterns)) {
      if (isValidChar(oldChar, patternChar, customPatterns)) {
        rawCharsBeforeCursor++
        oldPos++
        patternPos++
      } else {
        oldPos++
      }
    } else {
      if (oldChar === patternChar) {
        oldPos++
        patternPos++
      } else {
        rawCharsBeforeCursor++
        oldPos++
      }
    }
  }

  while (oldPos < oldCursorPos && oldPos < oldValue.length) {
    rawCharsBeforeCursor++
    oldPos++
  }

  let newCursorPos = 0
  let rawCharsCounted = 0
  patternPos = 0

  while (
    patternPos < pattern.length &&
    rawCharsCounted < rawCharsBeforeCursor &&
    newCursorPos < newValue.length
  ) {
    const patternChar = pattern[patternPos]
    const newChar = newValue[newCursorPos]

    if (isPatternToken(patternChar, customPatterns)) {
      if (isValidChar(newChar, patternChar, customPatterns)) {
        rawCharsCounted++
        newCursorPos++
        patternPos++
      } else {
        newCursorPos++
        patternPos++
      }
    } else {
      newCursorPos++
      patternPos++
    }
  }

  while (
    rawCharsCounted < rawCharsBeforeCursor &&
    newCursorPos < newValue.length
  ) {
    newCursorPos++
    rawCharsCounted++
  }

  return Math.min(newCursorPos, newValue.length)
}

export function generatePlaceholder(
  pattern: string,
  maskChar: string,
  customPatterns?: CustomPatterns
): string {
  if (!pattern) return ''
  let out = ''
  for (const ch of pattern) {
    out += isPatternToken(ch, customPatterns) ? maskChar : ch
  }
  return out
}

export function skeletonFromPattern(
  pattern: string,
  maskChar: string,
  customPatterns?: CustomPatterns
): string {
  return generatePlaceholder(pattern, maskChar, customPatterns)
}

export function firstTokenIndex(
  pattern: string,
  customPatterns?: CustomPatterns
): number {
  for (let i = 0; i < pattern.length; i++) {
    if (isPatternToken(pattern[i], customPatterns)) return i
  }
  return 0
}
