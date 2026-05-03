import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import PatternText from './PatternText.svelte'
import { MaskPatterns } from './maskPatterns.js'

describe('PatternText.svelte', () => {
  afterEach(() => {
    cleanup()
  })

  it('formats a phone number', () => {
    const { container } = render(PatternText, {
      props: {
        value: '1234567890',
        format: MaskPatterns.PHONE_US
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('(123) 456-7890')
  })

  it('formats a date', () => {
    const { container } = render(PatternText, {
      props: {
        value: '12252024',
        format: MaskPatterns.DATE_US
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('12/25/2024')
  })

  it('accepts numeric value and stringifies it', () => {
    const { container } = render(PatternText, {
      props: {
        value: 1234567890,
        format: MaskPatterns.PHONE_US
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('(123) 456-7890')
  })

  it('renders fallback when value is null', () => {
    const { container } = render(PatternText, {
      props: {
        value: null,
        format: MaskPatterns.PHONE_US,
        fallback: '—'
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('—')
  })

  it('passes through without pattern', () => {
    const { container } = render(PatternText, {
      props: { value: 'hello' }
    })

    expect(container.querySelector('span')?.textContent).toBe('hello')
  })

  it('forwards HTML attributes to the span', () => {
    const { container } = render(PatternText, {
      props: {
        value: '1234567890',
        format: MaskPatterns.PHONE_US,
        class: 'phone',
        'data-test': 'display'
      }
    })

    const span = container.querySelector('span')!
    expect(span.className).toBe('phone')
    expect(span.getAttribute('data-test')).toBe('display')
  })
})
