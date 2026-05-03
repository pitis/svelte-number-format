import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import { NumberFormatStyle } from 'intl-number-input'
import NumericText from './NumericText.svelte'

describe('NumericText.svelte', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a number with thousands separator', () => {
    const { container } = render(NumericText, {
      props: {
        value: 1234.56,
        locale: 'en-US',
        options: { precision: 2 }
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('1,234.56')
  })

  it('renders currency', () => {
    const { container } = render(NumericText, {
      props: {
        value: 99.99,
        locale: 'en-US',
        options: {
          formatStyle: NumberFormatStyle.Currency,
          currency: 'USD',
          precision: 2
        }
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('$99.99')
  })

  it('renders percentage', () => {
    const { container } = render(NumericText, {
      props: {
        value: 0.75,
        locale: 'en-US',
        options: {
          formatStyle: NumberFormatStyle.Percent,
          precision: 0
        }
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('75%')
  })

  it('renders German locale formatting', () => {
    const { container } = render(NumericText, {
      props: {
        value: 1234.56,
        locale: 'de-DE',
        options: { precision: 2 }
      }
    })

    const text = container.querySelector('span')?.textContent ?? ''
    expect(text).toContain('1.234')
    expect(text).toContain(',56')
  })

  it('renders fallback when value is null', () => {
    const { container } = render(NumericText, {
      props: { value: null, fallback: '—' }
    })

    expect(container.querySelector('span')?.textContent).toBe('—')
  })

  it('renders fallback when value is non-finite', () => {
    const { container } = render(NumericText, {
      props: { value: 'not a number', fallback: 'N/A' }
    })

    expect(container.querySelector('span')?.textContent).toBe('N/A')
  })

  it('accepts string number', () => {
    const { container } = render(NumericText, {
      props: {
        value: '1234.5',
        locale: 'en-US',
        options: { precision: 2 }
      }
    })

    expect(container.querySelector('span')?.textContent).toBe('1,234.50')
  })

  it('renders negative currency with accounting parentheses when accountingSign is true', () => {
    const { container } = render(NumericText, {
      props: {
        value: -1234.56,
        locale: 'en-US',
        options: {
          formatStyle: NumberFormatStyle.Currency,
          currency: 'USD',
          precision: 2,
          accountingSign: true
        }
      }
    })

    const text = container.querySelector('span')?.textContent ?? ''
    expect(text).toContain('(')
    expect(text).toContain(')')
    expect(text).toContain('1,234.56')
    expect(text).not.toContain('-')
  })

  it('renders negative currency with minus sign by default (no accountingSign)', () => {
    const { container } = render(NumericText, {
      props: {
        value: -1234.56,
        locale: 'en-US',
        options: {
          formatStyle: NumberFormatStyle.Currency,
          currency: 'USD',
          precision: 2
        }
      }
    })

    const text = container.querySelector('span')?.textContent ?? ''
    expect(text).toContain('-')
    expect(text).not.toContain('(')
  })

  it('accountingSign is a no-op for non-currency format', () => {
    const { container } = render(NumericText, {
      props: {
        value: -1234.56,
        locale: 'en-US',
        options: {
          precision: 2,
          accountingSign: true
        }
      }
    })

    const text = container.querySelector('span')?.textContent ?? ''
    expect(text).toContain('-')
    expect(text).not.toContain('(')
  })

  it('forwards HTML attributes to the span', () => {
    const { container } = render(NumericText, {
      props: {
        value: 10,
        class: 'money',
        'data-test': 'numeric-display'
      }
    })

    const span = container.querySelector('span')!
    expect(span.className).toBe('money')
    expect(span.getAttribute('data-test')).toBe('numeric-display')
  })
})
