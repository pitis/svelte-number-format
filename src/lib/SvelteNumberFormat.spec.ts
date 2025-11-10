import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import { NumberFormatStyle } from 'intl-number-input'
import NumberFormat from './SvelteNumberFormat.svelte'

describe('NumberFormat.svelte', () => {
  afterEach(() => {
    cleanup()
  })

  describe('Basic Number Input', () => {
    it('formats number with thousands separator', async () => {
      const { container } = render(NumberFormat, {
        props: {
          value: 1234.56,
          options: { precision: 2 }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input).toBeTruthy()

      // Wait for formatting to apply
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('1,234.56')
    })

    it('formats large numbers correctly', async () => {
      const { container } = render(NumberFormat, {
        props: {
          value: 100012123,
          options: { precision: 2 }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('100,012,123.00')
    })
  })

  describe('Currency (USD)', () => {
    it('formats USD currency correctly', async () => {
      const { container } = render(NumberFormat, {
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

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('$99.99')
    })

    it('formats larger USD amounts', async () => {
      const { container } = render(NumberFormat, {
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

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('$1,234.56')
    })
  })

  describe('Percentage', () => {
    it('formats percentage correctly', async () => {
      const { container } = render(NumberFormat, {
        props: {
          value: 0.75,
          locale: 'en-US',
          options: {
            formatStyle: NumberFormatStyle.Percent,
            precision: 2
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('75.00%')
    })

    it('formats decimal as percentage', async () => {
      const { container } = render(NumberFormat, {
        props: {
          value: 0.125,
          locale: 'en-US',
          options: {
            formatStyle: NumberFormatStyle.Percent,
            precision: 2
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('12.50%')
    })
  })

  describe('European Format (EUR)', () => {
    it('formats EUR with European locale', async () => {
      const { container } = render(NumberFormat, {
        props: {
          value: 1234.56,
          locale: 'de-DE',
          options: {
            formatStyle: NumberFormatStyle.Currency,
            currency: 'EUR',
            precision: 2
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      // German locale uses period for thousands and comma for decimals
      expect(input.value).toContain('1.234,56')
      expect(input.value).toContain('€')
    })
  })

  describe('Value Range', () => {
    it('respects min/max value range', async () => {
      const { container } = render(NumberFormat, {
        props: {
          value: 500,
          options: {
            precision: 2,
            valueRange: { min: 0, max: 1000 }
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('500.00')
    })
  })

  describe('Auto Decimal Mode', () => {
    it('auto-inserts decimal point', async () => {
      const { container } = render(NumberFormat, {
        props: {
          value: 99.99,
          options: {
            precision: 2,
            autoDecimalDigits: true
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(input.value).toBe('99.99')
    })
  })

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      const { container } = render(NumberFormat, {
        props: {
          placeholder: 'Enter amount',
          class: 'custom-input',
          id: 'test-input'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.placeholder).toBe('Enter amount')
      expect(input.className).toBe('custom-input')
      expect(input.id).toBe('test-input')
    })
  })
})
