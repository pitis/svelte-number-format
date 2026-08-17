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

  describe('External value updates (regression: issue #14)', () => {
    it('clears the input when value is set to null externally', async () => {
      const { container, rerender } = render(NumericFormat, {
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
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(input.value).toBe('$1,234.56')

      await rerender({
        value: null,
        locale: 'en-US',
        options: {
          formatStyle: NumberFormatStyle.Currency,
          currency: 'USD',
          precision: 2
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(input.value).toBe('')
    })

    it('updates the input when value changes to a different number externally', async () => {
      const { container, rerender } = render(NumericFormat, {
        props: { value: 100, options: { precision: 2 } }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(input.value).toBe('100.00')

      await rerender({ value: 9999.5, options: { precision: 2 } })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(input.value).toBe('9,999.50')
    })
  })

  describe('Native form submission (regression: issue #15)', () => {
    const visibleOf = (container: HTMLElement) =>
      container.querySelector('input:not([type="hidden"])') as HTMLInputElement
    const hiddenOf = (container: HTMLElement) =>
      container.querySelector('input[type="hidden"]') as HTMLInputElement

    it('renders a hidden input with the raw value and keeps the visible input unnamed', async () => {
      const { container } = render(NumericFormat, {
        props: {
          name: 'amount',
          value: 1234.56,
          locale: 'en-US',
          options: { precision: 2 }
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const visible = visibleOf(container)
      const hidden = hiddenOf(container)
      expect(visible.value).toBe('1,234.56')
      expect(visible.getAttribute('name')).toBeNull()
      expect(hidden).toBeTruthy()
      expect(hidden.getAttribute('name')).toBe('amount')
      expect(hidden.value).toBe('1234.56')
    })

    it('submits the raw value through FormData', async () => {
      const { container } = render(NumericFormat, {
        props: {
          name: 'amount',
          value: 1234.56,
          locale: 'en-US',
          options: { precision: 2 }
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const form = document.createElement('form')
      form.append(...Array.from(container.childNodes))
      container.appendChild(form)

      expect(new FormData(form).get('amount')).toBe('1234.56')
    })

    it('does not render a hidden input without a name', async () => {
      const { container } = render(NumericFormat, {
        props: { value: 100, options: { precision: 2 } }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(container.querySelectorAll('input').length).toBe(1)
      expect(container.querySelector('input[type="hidden"]')).toBeNull()
    })

    it('keeps the hidden input in sync while typing, before blur', async () => {
      const { container } = render(NumericFormat, {
        props: {
          name: 'amount',
          value: 0,
          locale: 'en-US',
          options: { precision: 2 }
        }
      })

      const visible = visibleOf(container)
      await new Promise((resolve) => setTimeout(resolve, 50))

      visible.focus()
      visible.value = '9999.99'
      await fireEvent.input(visible)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(hiddenOf(container).value).toBe('9999.99')

      await fireEvent.blur(visible)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(visible.value).toBe('9,999.99')
      expect(hiddenOf(container).value).toBe('9999.99')
    })

    it('renders an empty hidden value when value is null', async () => {
      const { container } = render(NumericFormat, {
        props: { name: 'amount', value: null }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const hidden = hiddenOf(container)
      expect(hidden).toBeTruthy()
      expect(hidden.value).toBe('')
    })

    it('carries the raw value when valueType="string"', async () => {
      const { container } = render(NumericFormat, {
        props: {
          name: 'amount',
          value: '1234.5',
          valueType: 'string',
          options: { precision: 2 }
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(hiddenOf(container).value).toBe('1234.5')
    })

    it('routes name to the hidden input when props arrive via spread (Formsnap shape)', async () => {
      const formsnapLikeProps = {
        name: 'amount',
        id: 'amount-field',
        'aria-describedby': 'amount-error',
        value: 42
      }
      const { container } = render(NumericFormat, {
        props: { ...formsnapLikeProps }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const visible = visibleOf(container)
      const hidden = hiddenOf(container)
      expect(visible.getAttribute('name')).toBeNull()
      expect(visible.id).toBe('amount-field')
      expect(visible.getAttribute('aria-describedby')).toBe('amount-error')
      expect(hidden.getAttribute('name')).toBe('amount')
      expect(hidden.value).toBe('42')
    })

    it('syncs the hidden input on external value updates', async () => {
      const { container, rerender } = render(NumericFormat, {
        props: { name: 'amount', value: 100, options: { precision: 2 } }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(hiddenOf(container).value).toBe('100')

      await rerender({
        name: 'amount',
        value: 9999.5,
        options: { precision: 2 }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(hiddenOf(container).value).toBe('9999.5')
    })
  })
})
