import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/svelte'
import PatternFormat from './PatternFormat.svelte'
import { MaskPatterns } from './maskPatterns.js'

describe('PatternFormat.svelte', () => {
  afterEach(() => {
    cleanup()
  })

  describe('Phone Number Pattern', () => {
    it('formats phone number correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input).toBeTruthy()

      // Simulate typing a phone number
      input.value = '1234567890'
      await fireEvent.input(input)

      expect(input.value).toBe('(123) 456-7890')
    })

    it('handles partial phone input', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12345'
      await fireEvent.input(input)

      expect(input.value).toBe('(123) 45')
    })

    it('rejects non-numeric characters in phone', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123abc456'
      await fireEvent.input(input)

      expect(input.value).toBe('(123) 456')
    })
  })

  describe('Credit Card Pattern', () => {
    it('formats credit card number correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.CREDIT_CARD
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1234567890123456'
      await fireEvent.input(input)

      expect(input.value).toBe('1234 5678 9012 3456')
    })

    it('handles partial credit card input', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.CREDIT_CARD
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12345678'
      await fireEvent.input(input)

      expect(input.value).toBe('1234 5678')
    })
  })

  describe('Date Pattern', () => {
    it('formats US date correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.DATE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12252024'
      await fireEvent.input(input)

      expect(input.value).toBe('12/25/2024')
    })

    it('formats ISO date correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.DATE_ISO
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '20241225'
      await fireEvent.input(input)

      expect(input.value).toBe('2024-12-25')
    })
  })

  describe('SSN Pattern', () => {
    it('formats SSN correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.SSN
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123456789'
      await fireEvent.input(input)

      expect(input.value).toBe('123-45-6789')
    })
  })

  describe('ZIP Code Pattern', () => {
    it('formats 5-digit ZIP correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.ZIP_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12345'
      await fireEvent.input(input)

      expect(input.value).toBe('12345')
    })

    it('formats ZIP+4 correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.ZIP_US_PLUS4
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123456789'
      await fireEvent.input(input)

      expect(input.value).toBe('12345-6789')
    })
  })

  describe('Custom Patterns', () => {
    it('handles letter pattern (A)', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'AAA-###'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = 'ABC123'
      await fireEvent.input(input)

      expect(input.value).toBe('ABC-123')
    })

    it('rejects digits in letter positions', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'AAA'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123ABC'
      await fireEvent.input(input)

      expect(input.value).toBe('ABC')
    })

    it('handles alphanumeric pattern (*)', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '***-***'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = 'A1B2C3'
      await fireEvent.input(input)

      expect(input.value).toBe('A1B-2C3')
    })

    it('handles mixed pattern correctly', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'AA-##-**'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = 'AB12XY'
      await fireEvent.input(input)

      expect(input.value).toBe('AB-12-XY')
    })
  })

  describe('Callbacks', () => {
    it('calls onInput callback with raw and formatted values', async () => {
      let rawValue: string | null = null
      let formattedValue: string | null = null

      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          onInput: (raw: string | null, formatted: string | null) => {
            rawValue = raw
            formattedValue = formatted
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1234567890'
      await fireEvent.input(input)

      expect(rawValue).toBe('1234567890')
      expect(formattedValue).toBe('(123) 456-7890')
    })

    it('calls onValueChange with rich payload on input', async () => {
      const calls: Array<{
        floatValue: number | undefined
        formattedValue: string
        value: string
      }> = []
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          onValueChange: (values) => calls.push(values)
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.value = '1234567890'
      await fireEvent.input(input)

      expect(calls.length).toBe(1)
      expect(calls[0].value).toBe('1234567890')
      expect(calls[0].formattedValue).toBe('(123) 456-7890')
      expect(calls[0].floatValue).toBe(1234567890)
    })

    it('onValueChange reports undefined floatValue for non-numeric patterns', async () => {
      const calls: Array<{ floatValue: number | undefined }> = []
      const { container } = render(PatternFormat, {
        props: {
          format: 'AAA-###',
          onValueChange: (values) => calls.push(values)
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.value = 'ABC123'
      await fireEvent.input(input)

      expect(calls[0].floatValue).toBe(undefined)
    })

    it('calls onChange callback on change event', async () => {
      let rawValue: string | null = null
      let formattedValue: string | null = null

      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.DATE_US,
          onChange: (raw: string | null, formatted: string | null) => {
            rawValue = raw
            formattedValue = formatted
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '12252024'
      await fireEvent.change(input)

      expect(rawValue).toBe('12252024')
      expect(formattedValue).toBe('12/25/2024')
    })
  })

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          placeholder: 'Enter phone',
          class: 'custom-input',
          id: 'test-input'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.placeholder).toBe('Enter phone')
      expect(input.className).toBe('custom-input')
      expect(input.id).toBe('test-input')
    })

    it('auto-generates placeholder from pattern when not provided', () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '###-##-####',
          maskChar: '_'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.placeholder).toBe('___-__-____')
    })
  })

  describe('Empty and Null Values', () => {
    it('handles empty initial value', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: null
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('returns null for completely empty input', async () => {
      let rawValue: string | null = 'initial'

      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          onInput: (raw: string | null) => {
            rawValue = raw
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = ''
      await fireEvent.input(input)

      expect(rawValue).toBe(null)
    })
  })

  describe('Literal Characters', () => {
    it('automatically adds literal characters', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '(###) ###-####'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123'
      await fireEvent.input(input)

      // Should add opening paren automatically
      expect(input.value).toContain('(')
    })

    it('skips over literal characters when typing', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '##/##/####'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1225'
      await fireEvent.input(input)

      // Should automatically add slashes
      expect(input.value).toBe('12/25')
    })
  })

  describe('Paste Handling', () => {
    function firePaste(input: HTMLInputElement, text: string) {
      const event = new Event('paste', {
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: (type: string) => (type === 'text' ? text : '') }
      })
      return fireEvent(input, event)
    }

    it('formats pasted digits into an empty phone field', async () => {
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.focus()
      input.setSelectionRange(0, 0)

      await firePaste(input, '1234567890')

      expect(input.value).toBe('(123) 456-7890')
    })

    it('strips formatting from pasted pre-formatted phone', async () => {
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.focus()
      input.setSelectionRange(0, 0)

      await firePaste(input, '(415) 555-1234')

      expect(input.value).toBe('(415) 555-1234')
    })

    it('truncates paste that exceeds pattern length', async () => {
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.ZIP_US }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.focus()
      input.setSelectionRange(0, 0)

      await firePaste(input, '1234567890')

      expect(input.value).toBe('12345')
    })

    it('rejects non-matching chars in pasted content', async () => {
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.DATE_US }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.focus()
      input.setSelectionRange(0, 0)

      await firePaste(input, 'abc12252024xyz')

      expect(input.value).toBe('12/25/2024')
    })

    it('updates bound value after paste via onInput callback', async () => {
      let raw: string | null = null
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          onInput: (r: string | null) => {
            raw = r
          }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.focus()
      input.setSelectionRange(0, 0)

      await firePaste(input, '4155551234')

      expect(raw).toBe('4155551234')
    })
  })

  describe('IME composition', () => {
    it('skips masking during active composition', async () => {
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US }
      })

      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent(input, new CompositionEvent('compositionstart'))
      input.value = 'あい'
      await fireEvent.input(input)

      // While composing, value should not be re-masked
      expect(input.value).toBe('あい')
    })

    it('re-masks on compositionend', async () => {
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US }
      })

      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent(input, new CompositionEvent('compositionstart'))
      input.value = '1234567890'
      await fireEvent.input(input)
      await fireEvent(input, new CompositionEvent('compositionend'))

      expect(input.value).toBe('(123) 456-7890')
    })
  })

  describe('Keyboard navigation', () => {
    it('Home key is not hijacked', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '1234567890'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((r) => setTimeout(r, 10))
      input.focus()
      input.setSelectionRange(5, 5)

      await fireEvent.keyDown(input, { key: 'Home' })

      // Home is a no-op in our handler; the default behavior (move cursor)
      // is what the browser does natively. Assert value still intact.
      expect(input.value).toBe('(123) 456-7890')
    })

    it('End key is not hijacked', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '1234567890'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((r) => setTimeout(r, 10))
      input.focus()
      input.setSelectionRange(0, 0)

      await fireEvent.keyDown(input, { key: 'End' })

      expect(input.value).toBe('(123) 456-7890')
    })

    it('ArrowLeft/ArrowRight are not hijacked', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '1234567890'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((r) => setTimeout(r, 10))

      await fireEvent.keyDown(input, { key: 'ArrowLeft' })
      await fireEvent.keyDown(input, { key: 'ArrowRight' })

      expect(input.value).toBe('(123) 456-7890')
    })

    it('Backspace removes the preceding raw char', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.value = '1234567890'
      await fireEvent.input(input)

      // Simulate backspace: user would use a real DOM method. Here we mimic
      // the end state the browser produces after backspace: value shortened,
      // then input handler runs.
      input.value = '(123) 456-789'
      await fireEvent.input(input)

      expect(input.value).toBe('(123) 456-789')
    })
  })

  describe('Focus round-trip', () => {
    it('re-applies formatting when value changes while blurred', async () => {
      const { rerender, container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '1234567890'
        }
      })

      let input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('(123) 456-7890')

      await rerender({
        format: MaskPatterns.PHONE_US,
        value: '9998887777'
      })

      input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('(999) 888-7777')
    })
  })

  describe('allowEmptyFormatting', () => {
    it('renders the skeleton in the input when value is empty', () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          allowEmptyFormatting: true
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('(___) ___-____')
    })

    it('renders the formatted value when value is set', () => {
      const { container } = render(PatternFormat, {
        props: {
          value: '4155551234',
          format: MaskPatterns.PHONE_US,
          allowEmptyFormatting: true
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('(415) 555-1234')
    })

    it('default behavior keeps input empty when value is empty', () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Hex / Binary Custom Patterns', () => {
    it('accepts hex chars via custom H token', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'HHHHHH',
          customPatterns: { H: /[0-9a-fA-F]/ }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.value = 'ff00aa'
      await fireEvent.input(input)

      expect(input.value).toBe('ff00aa')
    })

    it('rejects non-matching chars for custom H token', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'HHH',
          customPatterns: { H: /[0-9a-fA-F]/ }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.value = 'gzq'
      await fireEvent.input(input)

      expect(input.value).toBe('')
    })

    it('supports multiple custom tokens in same pattern', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'BBBB-BB',
          customPatterns: { B: /[01]/ }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.value = '101010'
      await fireEvent.input(input)

      expect(input.value).toBe('1010-10')
    })

    it('mixes custom and built-in tokens', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: '##-HH',
          customPatterns: { H: /[a-f]/ }
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      input.value = '12ab'
      await fireEvent.input(input)

      expect(input.value).toBe('12-ab')
    })
  })

  describe('Accessibility & input mode', () => {
    it('sets aria-placeholder to the auto-generated mask', () => {
      const { container } = render(PatternFormat, {
        props: { format: '###-##-####' }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.getAttribute('aria-placeholder')).toBe('___-__-____')
    })

    it('sets inputmode="tel" for phone-like patterns', () => {
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.getAttribute('inputmode')).toBe('tel')
    })

    it('sets inputmode="numeric" for digits-only patterns', () => {
      const { container } = render(PatternFormat, {
        props: { format: '#####' }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.getAttribute('inputmode')).toBe('numeric')
    })

    it('sets inputmode="text" for letter-containing patterns', () => {
      const { container } = render(PatternFormat, {
        props: { format: 'AAA-###' }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.getAttribute('inputmode')).toBe('text')
    })

    it('lets consumer override inputmode', () => {
      const { container } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          inputmode: 'none'
        }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.getAttribute('inputmode')).toBe('none')
    })
  })

  describe('Native form submission (regression: issue #15)', () => {
    const visibleOf = (container: HTMLElement) =>
      container.querySelector('input:not([type="hidden"])') as HTMLInputElement
    const hiddenOf = (container: HTMLElement) =>
      container.querySelector('input[type="hidden"]') as HTMLInputElement

    it('renders a hidden input with the raw digits and keeps the visible input unnamed', async () => {
      const { container } = render(PatternFormat, {
        props: {
          name: 'phone',
          value: '4155551234',
          format: MaskPatterns.PHONE_US
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const visible = visibleOf(container)
      const hidden = hiddenOf(container)
      expect(visible.value).toBe('(415) 555-1234')
      expect(visible.getAttribute('name')).toBeNull()
      expect(hidden.getAttribute('name')).toBe('phone')
      expect(hidden.value).toBe('4155551234')

      const form = document.createElement('form')
      form.append(...Array.from(container.childNodes))
      container.appendChild(form)
      expect(new FormData(form).get('phone')).toBe('4155551234')
    })

    it('never submits the mask skeleton with allowEmptyFormatting', async () => {
      const { container } = render(PatternFormat, {
        props: {
          name: 'phone',
          value: null,
          format: MaskPatterns.PHONE_US,
          allowEmptyFormatting: true
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const visible = visibleOf(container)
      expect(visible.value).toBe('(___) ___-____')
      expect(hiddenOf(container).value).toBe('')

      await fireEvent.focus(visible)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(visible.value).toBe('(___) ___-____')
      expect(hiddenOf(container).value).toBe('')
    })

    it('keeps the hidden input in sync with partial input, before change/blur', async () => {
      const { container } = render(PatternFormat, {
        props: { name: 'phone', format: MaskPatterns.PHONE_US }
      })

      const visible = visibleOf(container)
      visible.focus()
      visible.value = '415555'
      await fireEvent.input(visible)

      expect(hiddenOf(container).value).toBe('415555')
    })

    it('does not render a hidden input without a name', async () => {
      const { container } = render(PatternFormat, {
        props: { value: '4155551234', format: MaskPatterns.PHONE_US }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(container.querySelectorAll('input').length).toBe(1)
      expect(container.querySelector('input[type="hidden"]')).toBeNull()
    })

    it('normalizes a parent-provided value through the mask before submitting', async () => {
      const { container } = render(PatternFormat, {
        props: { name: 'code', value: 'abc123', format: '###-###' }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(visibleOf(container).value).toBe('123')
      expect(hiddenOf(container).value).toBe('123')

      const form = document.createElement('form')
      form.append(...Array.from(container.childNodes))
      container.appendChild(form)
      expect(new FormData(form).get('code')).toBe('123')
    })

    it('mirrors disabled onto the hidden input so disabled fields do not submit', async () => {
      const { container } = render(PatternFormat, {
        props: {
          name: 'phone',
          value: '4155551234',
          format: MaskPatterns.PHONE_US,
          disabled: true
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(visibleOf(container).disabled).toBe(true)
      expect(hiddenOf(container).disabled).toBe(true)

      const form = document.createElement('form')
      form.append(...Array.from(container.childNodes))
      container.appendChild(form)
      expect(new FormData(form).get('phone')).toBeNull()
    })

    it('mirrors the form attribute onto both inputs', async () => {
      const { container } = render(PatternFormat, {
        props: {
          name: 'phone',
          value: '4155551234',
          format: MaskPatterns.PHONE_US,
          form: 'checkout'
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(visibleOf(container).getAttribute('form')).toBe('checkout')
      expect(hiddenOf(container).getAttribute('form')).toBe('checkout')
    })

    it('clears the hidden input on form.reset() instead of keeping a stale value', async () => {
      const { container } = render(PatternFormat, {
        props: { name: 'phone', format: MaskPatterns.PHONE_US }
      })

      const visible = visibleOf(container)
      visible.focus()
      visible.value = '4155551234'
      await fireEvent.input(visible)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(hiddenOf(container).value).toBe('4155551234')

      const form = document.createElement('form')
      form.append(...Array.from(container.childNodes))
      container.appendChild(form)
      form.reset()
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(hiddenOf(container).value).toBe('')
      expect(new FormData(form).get('phone')).toBe('')
    })
  })

  describe("onValueChange source (regression: SourceInfo.source 'prop')", () => {
    type Call = {
      values: {
        floatValue: number | undefined
        formattedValue: string
        value: string
      }
      info: { event: Event | undefined; source: 'event' | 'prop' }
    }

    function collect() {
      const calls: Call[] = []
      const onValueChange = (values: Call['values'], info: Call['info']) =>
        calls.push({ values, info })
      return { calls, onValueChange }
    }

    function firePaste(input: HTMLInputElement, text: string) {
      const event = new Event('paste', {
        bubbles: true,
        cancelable: true
      })
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: (type: string) => (type === 'text' ? text : '') }
      })
      return fireEvent(input, event)
    }

    it('does not emit on initial mount', async () => {
      const { calls, onValueChange } = collect()
      render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '4155551234',
          onValueChange
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(0)
    })

    it("emits exactly one 'prop' call for an external value update", async () => {
      const { calls, onValueChange } = collect()
      const { rerender } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '1234567890',
          onValueChange
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      calls.length = 0

      await rerender({
        format: MaskPatterns.PHONE_US,
        value: '9998887777',
        onValueChange
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(1)
      expect(calls[0].info.source).toBe('prop')
      expect(calls[0].info.event).toBeUndefined()
      expect(calls[0].values.value).toBe('9998887777')
      expect(calls[0].values.formattedValue).toBe('(999) 888-7777')
    })

    it("a keystroke emits exactly one 'event' call — no trailing 'prop'", async () => {
      const { calls, onValueChange } = collect()
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US, onValueChange }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1234567890'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(1)
      expect(calls[0].info.source).toBe('event')
      expect(calls[0].info.event).toBeInstanceOf(Event)
    })

    it("input followed by change emits two 'event' calls and nothing more", async () => {
      const { calls, onValueChange } = collect()
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US, onValueChange }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '1234567890'
      await fireEvent.input(input)
      await fireEvent.change(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(2)
      expect(calls.every((c) => c.info.source === 'event')).toBe(true)
    })

    it("paste emits exactly one 'event' call", async () => {
      const { calls, onValueChange } = collect()
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US, onValueChange }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.focus()
      await firePaste(input, '4155551234')
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(1)
      expect(calls[0].info.source).toBe('event')
      expect(calls[0].values.value).toBe('4155551234')
    })

    it("composition emits exactly one 'event' call, on compositionend", async () => {
      const { calls, onValueChange } = collect()
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US, onValueChange }
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.compositionStart(input)
      input.value = '415'
      await fireEvent.input(input)
      await fireEvent.compositionEnd(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(1)
      expect(calls[0].info.source).toBe('event')
    })

    it("backspace over a literal emits 'event' with the real KeyboardEvent and does not throw", async () => {
      const { calls, onValueChange } = collect()
      const { container } = render(PatternFormat, {
        props: { format: MaskPatterns.PHONE_US, onValueChange }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '123456'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(input.value).toBe('(123) 456')
      calls.length = 0

      // Cursor after the space literal: pattern[5] === ' '.
      input.setSelectionRange(6, 6)
      await fireEvent.keyDown(input, { key: 'Backspace' })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(1)
      expect(calls[0].info.source).toBe('event')
      expect(calls[0].info.event).toBeInstanceOf(Event)
      // The literal is re-applied by the mask; the raw digits are unchanged
      // and the caret has stepped over the literal.
      expect(calls[0].values.value).toBe('123456')
      expect(input.value).toBe('(123) 456')
    })

    it('does not emit when rerendered with the same value', async () => {
      const { calls, onValueChange } = collect()
      const { rerender } = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '4155551234',
          onValueChange
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      calls.length = 0

      await rerender({
        format: MaskPatterns.PHONE_US,
        value: '4155551234',
        onValueChange
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(0)
    })

    it("normalizes external values through the mask in the 'prop' payload", async () => {
      const { calls, onValueChange } = collect()
      const { rerender } = render(PatternFormat, {
        props: { format: '###-###', value: '111222', onValueChange }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      calls.length = 0

      await rerender({ format: '###-###', value: 'abc123', onValueChange })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(1)
      expect(calls[0].info.source).toBe('prop')
      expect(calls[0].values.value).toBe('123')
      expect(calls[0].values.formattedValue).toBe('123')
    })

    it("external clear carries the skeleton with allowEmptyFormatting, '' without", async () => {
      const withSkeleton = collect()
      const first = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          allowEmptyFormatting: true,
          value: '4155551234',
          onValueChange: withSkeleton.onValueChange
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      withSkeleton.calls.length = 0

      await first.rerender({
        format: MaskPatterns.PHONE_US,
        allowEmptyFormatting: true,
        value: null,
        onValueChange: withSkeleton.onValueChange
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(withSkeleton.calls.length).toBe(1)
      const skeletonCall = withSkeleton.calls[0]
      expect(skeletonCall.info.source).toBe('prop')
      expect(skeletonCall.values.value).toBe('')
      expect(skeletonCall.values.floatValue).toBeUndefined()
      expect(skeletonCall.values.formattedValue).toBe('(___) ___-____')
      cleanup()

      const plain = collect()
      const second = render(PatternFormat, {
        props: {
          format: MaskPatterns.PHONE_US,
          value: '4155551234',
          onValueChange: plain.onValueChange
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      plain.calls.length = 0

      await second.rerender({
        format: MaskPatterns.PHONE_US,
        value: null,
        onValueChange: plain.onValueChange
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(plain.calls.length).toBe(1)
      expect(plain.calls[0].values.formattedValue).toBe('')
    })

    it("form reset emits source 'prop' with an empty payload", async () => {
      const { calls, onValueChange } = collect()
      const { container } = render(PatternFormat, {
        props: {
          name: 'phone',
          format: MaskPatterns.PHONE_US,
          value: '4155551234',
          onValueChange
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      calls.length = 0

      const form = document.createElement('form')
      form.append(...Array.from(container.childNodes))
      container.appendChild(form)
      form.reset()
      await new Promise((resolve) => setTimeout(resolve, 50))

      const last = calls[calls.length - 1]
      expect(last).toBeDefined()
      expect(last.info.source).toBe('prop')
      expect(last.values.value).toBe('')
    })

    it("non-numeric patterns report floatValue undefined in 'prop' payloads", async () => {
      const { calls, onValueChange } = collect()
      const { rerender } = render(PatternFormat, {
        props: { format: 'AAA-###', value: 'XYZ111', onValueChange }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))
      calls.length = 0

      await rerender({ format: 'AAA-###', value: 'ABC123', onValueChange })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(1)
      expect(calls[0].info.source).toBe('prop')
      expect(calls[0].values.floatValue).toBeUndefined()
      expect(calls[0].values.value).toBe('ABC123')
    })
  })

  describe('Validation (validate / onValidate)', () => {
    const CPF_MASK = '###.###.###-##'
    const isCpf = (raw: string) => raw === '14550200286'

    function attrs(input: HTMLInputElement) {
      return {
        valid: input.getAttribute('data-valid'),
        ariaInvalid: input.getAttribute('aria-invalid')
      }
    }

    it('sets no validity attributes when validate is absent', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, value: '14550200286' }
      })
      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: null, ariaInvalid: null })
    })

    it('is indeterminate while empty', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, validate: isCpf }
      })
      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: null, ariaInvalid: null })
    })

    it('is indeterminate while the mask is only partially filled', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, validate: isCpf }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '145502002'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: null, ariaInvalid: null })
    })

    it('reports data-valid="true" without aria-invalid for a complete valid value', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, validate: isCpf }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '14550200286'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: 'true', ariaInvalid: null })
    })

    it('reports data-valid="false" and aria-invalid for a complete invalid value', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, validate: isCpf }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '14550200287'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: 'false', ariaInvalid: 'true' })
    })

    it('reverts to indeterminate when edited back below completeness', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, validate: isCpf }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '14550200286'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))
      input.value = '145.502.002-8'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: null, ariaInvalid: null })
    })

    it('validates pasted pre-formatted input in one shot', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, validate: isCpf }
      })
      const input = container.querySelector('input') as HTMLInputElement
      input.focus()

      const event = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', {
        value: {
          getData: (t: string) => (t === 'text' ? '145.502.002-86' : '')
        }
      })
      await fireEvent(input, event)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input).valid).toBe('true')
    })

    it('consumer-supplied aria-invalid wins over the computed one', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: CPF_MASK,
          value: '14550200286',
          validate: isCpf,
          'aria-invalid': 'true'
        }
      })
      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(input.getAttribute('data-valid')).toBe('true')
      expect(input.getAttribute('aria-invalid')).toBe('true')
    })

    it('onValidate is silent on mount for both prefilled valid and invalid values', async () => {
      const calls: Array<boolean | null> = []
      render(PatternFormat, {
        props: {
          format: CPF_MASK,
          value: '14550200286',
          validate: isCpf,
          onValidate: (v: boolean | null) => calls.push(v)
        }
      })
      render(PatternFormat, {
        props: {
          format: CPF_MASK,
          value: '14550200287',
          validate: isCpf,
          onValidate: (v: boolean | null) => calls.push(v)
        }
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls.length).toBe(0)
    })

    it('fires onValidate(true) once when typing reaches a valid value, without repeats', async () => {
      const calls: Array<boolean | null> = []
      const { container } = render(PatternFormat, {
        props: {
          format: CPF_MASK,
          validate: isCpf,
          onValidate: (v: boolean | null) => calls.push(v)
        }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = '14550200286'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))
      await fireEvent.change(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls).toEqual([true])
    })

    it('fires onValidate(false) when a valid value is edited into an invalid one', async () => {
      const calls: Array<boolean | null> = []
      const { container } = render(PatternFormat, {
        props: {
          format: CPF_MASK,
          value: '14550200286',
          validate: isCpf,
          onValidate: (v: boolean | null) => calls.push(v)
        }
      })
      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))

      input.value = '145.502.002-87'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls).toEqual([false])
    })

    it('fires onValidate(null) when a complete value is cleared', async () => {
      const calls: Array<boolean | null> = []
      const { container } = render(PatternFormat, {
        props: {
          format: CPF_MASK,
          value: '14550200286',
          validate: isCpf,
          onValidate: (v: boolean | null) => calls.push(v)
        }
      })
      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))

      input.value = ''
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(calls).toEqual([null])
    })

    it('external value changes drive validity and fire onValidate', async () => {
      const calls: Array<boolean | null> = []
      const onValidate = (v: boolean | null) => calls.push(v)
      const { container, rerender } = render(PatternFormat, {
        props: {
          format: CPF_MASK,
          value: '14550200286',
          validate: isCpf,
          onValidate
        }
      })
      const input = container.querySelector('input') as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))

      await rerender({
        format: CPF_MASK,
        value: '14550200287',
        validate: isCpf,
        onValidate
      })
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(input.getAttribute('data-valid')).toBe('false')
      expect(calls).toEqual([false])
    })

    it('form.reset() clears validity to indeterminate and fires onValidate(null)', async () => {
      const calls: Array<boolean | null> = []
      const { container } = render(PatternFormat, {
        props: {
          name: 'cpf',
          format: CPF_MASK,
          value: '14550200286',
          validate: isCpf,
          onValidate: (v: boolean | null) => calls.push(v)
        }
      })
      const input = container.querySelector(
        'input:not([type="hidden"])'
      ) as HTMLInputElement
      await new Promise((resolve) => setTimeout(resolve, 50))

      const form = document.createElement('form')
      form.append(...Array.from(container.childNodes))
      container.appendChild(form)
      form.reset()
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: null, ariaInvalid: null })
      expect(calls).toEqual([null])
    })

    it('counts custom pattern tokens toward completeness', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: 'HH-HH',
          customPatterns: { H: /[0-9a-f]/ },
          validate: (raw: string) => raw === 'abcd'
        }
      })
      const input = container.querySelector('input') as HTMLInputElement

      input.value = 'abc'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(input.getAttribute('data-valid')).toBe(null)

      input.value = 'ab-cd'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(input.getAttribute('data-valid')).toBe('true')
    })

    it('stays indeterminate while allowEmptyFormatting shows the skeleton', async () => {
      const { container } = render(PatternFormat, {
        props: {
          format: CPF_MASK,
          allowEmptyFormatting: true,
          validate: isCpf
        }
      })
      const input = container.querySelector('input') as HTMLInputElement
      await fireEvent.focus(input)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(attrs(input)).toEqual({ valid: null, ariaInvalid: null })
    })

    it('does not update validity during IME composition', async () => {
      const { container } = render(PatternFormat, {
        props: { format: CPF_MASK, validate: isCpf }
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.compositionStart(input)
      input.value = '14550200286'
      await fireEvent.input(input)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(input.getAttribute('data-valid')).toBe(null)

      await fireEvent.compositionEnd(input)
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(input.getAttribute('data-valid')).toBe('true')
    })
  })
})
