import { describe, it, expect } from 'vitest'
import {
  applyMask,
  calculateCursorPosition,
  generatePlaceholder,
  isPatternToken,
  isValidChar
} from './cursor.js'

describe('isPatternToken', () => {
  it('identifies digit token', () => {
    expect(isPatternToken('#')).toBe(true)
  })

  it('identifies letter token', () => {
    expect(isPatternToken('A')).toBe(true)
  })

  it('identifies alphanumeric token', () => {
    expect(isPatternToken('*')).toBe(true)
  })

  it('rejects literal characters', () => {
    expect(isPatternToken('-')).toBe(false)
    expect(isPatternToken(' ')).toBe(false)
    expect(isPatternToken('(')).toBe(false)
    expect(isPatternToken('0')).toBe(false)
  })

  it('identifies custom tokens when provided', () => {
    const custom = { H: /[0-9a-fA-F]/ }
    expect(isPatternToken('H', custom)).toBe(true)
    expect(isPatternToken('-', custom)).toBe(false)
  })
})

describe('isValidChar', () => {
  it('accepts digits for #', () => {
    expect(isValidChar('0', '#')).toBe(true)
    expect(isValidChar('9', '#')).toBe(true)
  })

  it('rejects letters for #', () => {
    expect(isValidChar('a', '#')).toBe(false)
    expect(isValidChar('Z', '#')).toBe(false)
  })

  it('accepts letters for A', () => {
    expect(isValidChar('a', 'A')).toBe(true)
    expect(isValidChar('Z', 'A')).toBe(true)
  })

  it('rejects digits for A', () => {
    expect(isValidChar('0', 'A')).toBe(false)
  })

  it('accepts alphanumerics for *', () => {
    expect(isValidChar('a', '*')).toBe(true)
    expect(isValidChar('5', '*')).toBe(true)
  })

  it('rejects special chars for *', () => {
    expect(isValidChar('-', '*')).toBe(false)
    expect(isValidChar(' ', '*')).toBe(false)
  })

  it('matches literal char against itself', () => {
    expect(isValidChar('-', '-')).toBe(true)
    expect(isValidChar('a', '-')).toBe(false)
  })
})

describe('applyMask', () => {
  it('returns input as-is with empty pattern', () => {
    expect(applyMask('hello', '')).toEqual({
      masked: 'hello',
      raw: 'hello'
    })
  })

  it('applies US phone pattern', () => {
    expect(applyMask('1234567890', '(###) ###-####')).toEqual({
      masked: '(123) 456-7890',
      raw: '1234567890'
    })
  })

  it('handles partial phone input', () => {
    expect(applyMask('12345', '(###) ###-####')).toEqual({
      masked: '(123) 45',
      raw: '12345'
    })
  })

  it('drops invalid characters', () => {
    expect(applyMask('123abc456', '(###) ###-####')).toEqual({
      masked: '(123) 456',
      raw: '123456'
    })
  })

  it('handles credit card pattern', () => {
    expect(applyMask('1234567890123456', '#### #### #### ####')).toEqual({
      masked: '1234 5678 9012 3456',
      raw: '1234567890123456'
    })
  })

  it('handles US date', () => {
    expect(applyMask('12252024', '##/##/####')).toEqual({
      masked: '12/25/2024',
      raw: '12252024'
    })
  })

  it('handles letter-only pattern', () => {
    expect(applyMask('ABC123', 'AAA-###')).toEqual({
      masked: 'ABC-123',
      raw: 'ABC123'
    })
  })

  it('rejects digits where letter expected', () => {
    expect(applyMask('123ABC', 'AAA')).toEqual({
      masked: 'ABC',
      raw: 'ABC'
    })
  })

  it('handles alphanumeric pattern', () => {
    expect(applyMask('A1B2C3', '***-***')).toEqual({
      masked: 'A1B-2C3',
      raw: 'A1B2C3'
    })
  })

  it('handles mixed pattern', () => {
    expect(applyMask('AB12XY', 'AA-##-**')).toEqual({
      masked: 'AB-12-XY',
      raw: 'AB12XY'
    })
  })

  it('skips literals already present in input', () => {
    expect(applyMask('12/25', '##/##/####')).toEqual({
      masked: '12/25',
      raw: '1225'
    })
  })

  it('returns empty for empty input', () => {
    expect(applyMask('', '(###) ###-####')).toEqual({
      masked: '',
      raw: ''
    })
  })
})

describe('calculateCursorPosition', () => {
  it('handles cursor at start', () => {
    const pos = calculateCursorPosition(0, '', '(', '(###) ###-####')
    expect(pos).toBe(0)
  })

  it('places cursor after typed digit with literal prefix', () => {
    // typed "1" into empty field → formatted becomes "(1"
    // cursor was at 1 in oldValue "1", should land after the 1 → position 2 in "(1"
    const pos = calculateCursorPosition(1, '1', '(1', '(###) ###-####')
    expect(pos).toBe(2)
  })

  it('lands immediately after the last typed raw char', () => {
    // after typing 3 digits "123", formatted becomes "(123) "
    // cursor was at 3 in "123"; lands at 4 in "(123) " (right after '3')
    // trailing literals are not auto-traversed by cursor math
    const pos = calculateCursorPosition(3, '123', '(123) ', '(###) ###-####')
    expect(pos).toBe(4)
  })

  it('maintains cursor in middle of value', () => {
    // user typed "12" at the start of "34567890" → was "1234567890", cursor at 2
    // formatted: "(123) 456-7890"; cursor should land after the "12" → position 3
    const pos = calculateCursorPosition(
      2,
      '1234567890',
      '(123) 456-7890',
      '(###) ###-####'
    )
    expect(pos).toBe(3)
  })

  it('clamps to new value length', () => {
    const pos = calculateCursorPosition(999, '1', '(1', '(###) ###-####')
    expect(pos).toBe(2)
  })
})

describe('applyMask with customPatterns', () => {
  it('applies custom hex token H', () => {
    const result = applyMask('a1b2c3', 'HHHHHH', { H: /[0-9a-fA-F]/ })
    expect(result).toEqual({ masked: 'a1b2c3', raw: 'a1b2c3' })
  })

  it('rejects chars that do not match custom token', () => {
    const result = applyMask('a1bXc3', 'HHHHHH', { H: /[0-9a-fA-F]/ })
    expect(result).toEqual({ masked: 'a1bc3', raw: 'a1bc3' })
  })

  it('mixes custom and builtin tokens', () => {
    const result = applyMask('AB123', 'AA-###', { A: /[A-Z]/ })
    // builtin `A` is overridden by customPatterns `A: /[A-Z]/` — uppercase only
    // but our impl: custom wins over builtin since isValidChar consults customPatterns in default branch only,
    // so builtin `A` still runs on `A` — customPatterns are only used for NON-builtin tokens.
    expect(result.masked).toBe('AB-123')
    expect(result.raw).toBe('AB123')
  })

  it('custom binary token B works', () => {
    const result = applyMask('101010', 'BBBBBB', { B: /[01]/ })
    expect(result).toEqual({ masked: '101010', raw: '101010' })
  })
})

describe('generatePlaceholder', () => {
  it('replaces all token chars with maskChar', () => {
    expect(generatePlaceholder('(###) ###-####', '_')).toBe('(___) ___-____')
  })

  it('replaces mixed tokens', () => {
    expect(generatePlaceholder('AA-##-**', '_')).toBe('__-__-__')
  })

  it('works with custom maskChar', () => {
    expect(generatePlaceholder('###-##-####', '0')).toBe('000-00-0000')
  })

  it('returns empty for empty pattern', () => {
    expect(generatePlaceholder('', '_')).toBe('')
  })

  it('replaces custom token chars with maskChar', () => {
    expect(
      generatePlaceholder('HH-BBBB', '_', { H: /[0-9a-f]/, B: /[01]/ })
    ).toBe('__-____')
  })
})
