import { describe, it, expect } from 'vitest'
import { inferInputMode } from './inputmode.js'

describe('inferInputMode', () => {
  it('returns text for empty pattern', () => {
    expect(inferInputMode('')).toBe('text')
  })

  it('returns numeric for digits-only pattern', () => {
    expect(inferInputMode('####')).toBe('numeric')
    expect(inferInputMode('#####')).toBe('numeric')
  })

  it('returns tel for digit + literal pattern', () => {
    expect(inferInputMode('(###) ###-####')).toBe('tel')
    expect(inferInputMode('##/##/####')).toBe('tel')
    expect(inferInputMode('###-##-####')).toBe('tel')
  })

  it('returns text for letter-containing patterns', () => {
    expect(inferInputMode('AAA-###')).toBe('text')
    expect(inferInputMode('AA-##-**')).toBe('text')
  })

  it('returns text for alphanumeric patterns', () => {
    expect(inferInputMode('***-***')).toBe('text')
  })

  it('returns text for literal-only pattern', () => {
    expect(inferInputMode('---')).toBe('text')
  })
})
