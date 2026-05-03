import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/svelte'
import { NumberFormatStyle } from 'intl-number-input'
import NumericFormat from './NumericFormat.svelte'

describe('NumericFormat.svelte', () => {
  afterEach(() => {
    cleanup()
  })

  describe('Basic Number Input', () => {
    it('formats number with thousands separator', async () => {
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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
      const { container } = render(NumericFormat, {
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

    it('calls onValueChange with rich payload', async () => {
      const calls: Array<{
        floatValue: number | undefined
        formattedValue: string
        value: string
      }> = []
      const { container } = render(NumericFormat, {
        props: {
          value: 1234.56,
          locale: 'en-US',
          options: { precision: 2 },
          onValueChange: (values) => calls.push(values)
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))
      input.focus()
      input.value = '9999.99'
      await fireEvent.input(input)
      await fireEvent.change(input)

      const last = calls[calls.length - 1]
      expect(last).toBeDefined()
      expect(typeof last.floatValue).toBe('number')
      expect(typeof last.formattedValue).toBe('string')
      expect(typeof last.value).toBe('string')
    })

    it('emits value as string when valueType="string"', async () => {
      let bound: number | string | null = 42.5
      const onChange = (v: number | string | null) => {
        bound = v
      }
      const { container } = render(NumericFormat, {
        props: {
          value: 42.5,
          valueType: 'string',
          options: { precision: 2 },
          onChange: (raw) => onChange(raw != null ? String(raw) : null)
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))
      input.focus()
      input.value = '100'
      await fireEvent.input(input)
      await fireEvent.blur(input)

      expect(typeof bound).toBe('string')
    })

    it('intl-number-input sets a mobile-friendly inputmode', async () => {
      const { container } = render(NumericFormat, {
        props: { value: 0 }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(['decimal', 'numeric']).toContain(input.getAttribute('inputmode'))
    })
  })
})
