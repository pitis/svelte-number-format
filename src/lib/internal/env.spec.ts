import { describe, it, expect, afterEach, vi } from 'vitest'
import { defaultLocale } from './env.js'

describe('defaultLocale', () => {
  const originalNavigator = globalThis.navigator

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    })
    vi.restoreAllMocks()
  })

  it('returns navigator.language when available', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'fr-FR' },
      configurable: true,
      writable: true
    })
    expect(defaultLocale()).toBe('fr-FR')
  })

  it('falls back to en-US when navigator is undefined', () => {
    // @ts-expect-error — simulating SSR environment
    delete globalThis.navigator
    expect(defaultLocale()).toBe('en-US')
  })

  it('falls back to en-US when navigator.language is empty', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: '' },
      configurable: true,
      writable: true
    })
    expect(defaultLocale()).toBe('en-US')
  })

  it('falls back to en-US when navigator.language is the string "undefined"', () => {
    // Some test runners (e.g. Playwright under certain configs) expose
    // navigator.language as the literal string "undefined".
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'undefined' },
      configurable: true,
      writable: true
    })
    expect(defaultLocale()).toBe('en-US')
  })

  it('falls back to en-US on malformed locale tags', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: '!!not-a-locale!!' },
      configurable: true,
      writable: true
    })
    expect(defaultLocale()).toBe('en-US')
  })
})
