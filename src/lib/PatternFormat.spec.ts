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
})
