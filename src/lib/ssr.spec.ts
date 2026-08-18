import { describe, it, expect } from 'vitest'
import { render } from 'svelte/server'
import NumericFormat from './NumericFormat.svelte'
import PatternFormat from './PatternFormat.svelte'
import NumericText from './NumericText.svelte'
import PatternText from './PatternText.svelte'
import { MaskPatterns } from './maskPatterns.js'
import { NumberFormatStyle } from 'intl-number-input'

describe('SSR render (node environment, no DOM)', () => {
  it('renders NumericFormat without throwing', () => {
    const result = render(NumericFormat, {
      props: {
        value: 1234.56,
        locale: 'en-US',
        options: { precision: 2 }
      }
    })

    expect(result.body).toContain('<input')
    expect(result.body).not.toContain('type="hidden"')
  })

  it('renders a hidden raw-value input for NumericFormat when name is set', () => {
    const result = render(NumericFormat, {
      props: {
        name: 'amount',
        value: 1234.56,
        locale: 'en-US',
        options: { precision: 2 }
      }
    })

    expect(result.body).toContain('type="hidden"')
    expect(result.body).toContain('name="amount"')
    expect(result.body).toContain('value="1234.56"')
  })

  it('renders a hidden input with a SvelteKit n:-prefixed name intact', () => {
    const result = render(NumericFormat, {
      props: {
        name: 'n:amount',
        value: 1000,
        locale: 'en-US'
      }
    })

    expect(result.body).toContain('name="n:amount"')
    expect(result.body).toContain('value="1000"')
  })

  it('renders a hidden raw-value input for PatternFormat when name is set', () => {
    const result = render(PatternFormat, {
      props: {
        name: 'phone',
        value: '1234567890',
        format: MaskPatterns.PHONE_US
      }
    })

    expect(result.body).toContain('type="hidden"')
    expect(result.body).toContain('name="phone"')
    expect(result.body).toContain('value="1234567890"')
  })

  it('renders NumericFormat without locale prop (SSR fallback path)', () => {
    const result = render(NumericFormat, {
      props: {
        value: 99.99,
        options: { precision: 2 }
      }
    })

    expect(result.body).toContain('<input')
  })

  it('renders PatternFormat without throwing', () => {
    const result = render(PatternFormat, {
      props: {
        value: '1234567890',
        format: MaskPatterns.PHONE_US
      }
    })

    expect(result.body).toContain('<input')
  })

  it('renders NumericText with formatted currency value', () => {
    const result = render(NumericText, {
      props: {
        value: 1234.56,
        locale: 'en-US',
        options: {
          formatStyle: NumberFormatStyle.Currency,
          currency: 'USD',
          precision: 2
        }
      }
    })

    expect(result.body).toContain('<span')
    expect(result.body).toContain('$1,234.56')
  })

  it('renders PatternText with formatted phone', () => {
    const result = render(PatternText, {
      props: {
        value: '4155551234',
        format: MaskPatterns.PHONE_US
      }
    })

    expect(result.body).toContain('<span')
    expect(result.body).toContain('(415) 555-1234')
  })

  it('renders NumericText with fallback when value is null', () => {
    const result = render(NumericText, {
      props: {
        value: null,
        fallback: '—'
      }
    })

    expect(result.body).toContain('—')
  })

  it('prerenders validity attributes from the initial value', () => {
    const validate = (raw: string) => raw === '14550200286'

    const invalid = render(PatternFormat, {
      props: { format: '###.###.###-##', value: '14550200287', validate }
    })
    expect(invalid.body).toContain('data-valid="false"')
    expect(invalid.body).toContain('aria-invalid="true"')

    const valid = render(PatternFormat, {
      props: { format: '###.###.###-##', value: '14550200286', validate }
    })
    expect(valid.body).toContain('data-valid="true"')
    expect(valid.body).not.toContain('aria-invalid')

    const empty = render(PatternFormat, {
      props: { format: '###.###.###-##', validate }
    })
    expect(empty.body).not.toContain('data-valid')
    expect(empty.body).not.toContain('aria-invalid')
  })

  it('does not reference navigator at module scope', () => {
    // If any component pulled navigator.language at module init, the imports
    // above would have already thrown by now. This assertion codifies that.
    expect(typeof NumericFormat).toBe('function')
    expect(typeof PatternFormat).toBe('function')
    expect(typeof NumericText).toBe('function')
    expect(typeof PatternText).toBe('function')
  })
})
